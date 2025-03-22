from aiohttp import web
import aiofiles  
import json
import os
from typing import List
from Funciones.schemas import EmpleadoSchema, EmpleadoUpdateSchema, TareaSchema, DIAS_SEMANA, Users, UsersUpdate
from pydantic import ValidationError, SecretStr

UPLOAD_DIR = "./web/Images/"  #directorio de imagenes a guardar

def leer_empleados():
    archivo_empleados = './empleados.json'
    if os.path.exists(archivo_empleados):
        with open(archivo_empleados, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def guardar_empleados(empleados):
    archivo_empleados = './empleados.json'  
    with open(archivo_empleados, 'w', encoding='utf-8') as f:
        json.dump(empleados, f, indent=2)


def leer_users():
    archivo_users = './Funciones/users.json'
    if os.path.exists(archivo_users):
        with open(archivo_users, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"users": []}  

def guardar_users(users):
    archivo_user = './Funciones/users.json'
    for user in users:
        if isinstance(user.get("password"), SecretStr): #cambia el tipo SecretStr a str
            user["password"] = user["password"].get_secret_value() 

    with open(archivo_user, 'w', encoding='utf-8') as f:
        json.dump({"users": users}, f, indent=2)

#posiblemente eliminar esta funcion en un futuro
def guardar_user(user_data):
    archivo_user = './Funciones/users.json'
    users = leer_users()
    users["users"].append(user_data)
    with open(archivo_user, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2)

#-------------------------------------------------------------------------------#
async def empleados(request):
    return web.json_response(leer_empleados())


async def empleado_id(request):
    empleado_id = int(request.match_info['id'])
    empleado = next((e for e in leer_empleados() if e['id'] == empleado_id), None)
    if empleado:
        return web.json_response(empleado)
    return web.json_response({'message': 'Empleado no encontrado'}, status=404)


async def users_id(request):
    users_id = int(request.match_info['id'])
    users = leer_users()
    print("Users cargados:", users)
    print("Users id:", users_id)
    
    user = next((e for e in users['users'] if isinstance(e, dict) and int(e.get('empleado_id')) == users_id), None)
    
    if user:
        return web.json_response(user)
    return web.json_response({'message': 'Usuario no encontrado'}, status=404)

# Crear un nuevo empleado (comentado por el momento wn lo que se implementa nueva funcion)
"""
async def crear_empleado(request):
    reader = await request.multipart()

    print(reader)
    #data = await request.json()
    #print(f"DATA: {data}")
    ultimos = {
        "username": data.pop("username", None),  # Extraer 'username', si no existe devuelve None
        "password": data.pop("password", None) ,  # Extraer 'password', si no existe devuelve None
        "role": data.pop("role", None) 
    
    } 
    img={"imagen": data.pop("imagen", None)}
    subir_imagen()
    print(f"DATA: {data}")
    print(f"Ultimos: {ultimos}")
   
    try:
        empleado = EmpleadoSchema(**data)
        #añadimos un esquema para users.json
    except ValidationError as e:
        return web.json_response({"error": "Datos inválidos", "detail": e.errors()}, status=400)

    empleados = leer_empleados()
    nuevo_id = max([e['id'] for e in empleados], default=0) + 1
    nuevo_empleado = empleado.model_dump()
    nuevo_empleado["id"] = nuevo_id
    empleados.append(nuevo_empleado)
    
    guardar_empleados(empleados)
    ultimos["empleado_id"]=nuevo_id
    ultimos = Users(**ultimos)
    #guardar el json users
    print(ultimos)
    
    # Convertir a dict
    user_dict = ultimos.model_dump()
    print(user_dict) 
    # Convertir SecretStr a string plano para guardar
    user_dict["password"] = ultimos.password.get_secret_value()
    print(user_dict) 
    # Guardar en JSON
    guardar_user(user_dict)



    return web.json_response({"message": "Empleado agregado correctamente", "empleado": nuevo_empleado}, status=201)
"""

#Nuevo crear_empleas_

async def crear_empleado(request):
    """
    Maneja la  soporte para `multipart/form-data`.
    y guarda la imagen con el nombre del `username`.
    """

    reader = await request.multipart()
    data = {}
    imagen = None
    username = ""
    async for part in reader:
        if part.name == "imagen":   
            imagen = part
        else:                       # Si es un campo de texto
            field_data = await part.text()
            data[part.name] = field_data
            if part.name == "username":
                username = field_data

    if not imagen or not username:
        return web.json_response({"error": "Faltan imagen o username"}, status=400)
    filename = f"{username}.jpg"
    filepath = os.path.join(UPLOAD_DIR, filename)

    async with aiofiles.open(filepath, "wb") as f:
        while True:
            chunk = await imagen.read_chunk()  # Leer la imagen en chunks
            if not chunk:
                break
            await f.write(chunk)

    print(f"Imagen guardada correctamente: {filename}")

    empleado = {
        "nombre": data.get("nombre"),
        "puesto": data.get("puesto"),
        "imagen": filename  # Guardar el nombre de la imagen
    }
    user ={
        "username": username,
        "password": data.get("password"),
        "role": data.get("role"),
    }

    # Uno va para el json de users y el otro al de empleados
    print("Empleado creado:", empleado)
    print("user creado:", user)

    return web.json_response({"message": "Empleado agregado correctamente", "empleado": empleado}, status=201)


# Eliminar un empleado
async def eliminar_empleado(request):
    id = int(request.match_info['id']) 
    empleados = leer_empleados()
    empleado_index = next((i for i, e in enumerate(empleados) if e['id'] == id), None)
    users = leer_users().get("users", [])
    users_index = next((i for i, e in enumerate(users) if int(e['empleado_id']) == id), None)
    
    if empleado_index is None or users_index is None:
        return web.json_response({'message': 'Empleado/usuario no encontrado'}, status=404)

    empleados.pop(empleado_index)
    users.pop(users_index)
    guardar_empleados(empleados)
    guardar_users(users)
    return web.json_response({'message': 'Empleado eliminado correctamente'})

async def actualizar_empleado(request):
    empleado_id = int(request.match_info['id'])
    print(f"Obteniendo datos para el empleado con id {empleado_id}")

    try:
        data = await request.json()
        print(f"DATA: {data}")
        ultimos = {
            "username": data.pop("username", None), 
            "password": data.pop("password", None) , 
            "role": data.pop("role", None) 
        } 
        print(f"Datos recibidos en la solicitud: {data}")
        datos_actualizados = EmpleadoUpdateSchema(**data)
        print(f"Datos validados empleados: {datos_actualizados}")
        datos_user_actualizados =  UsersUpdate(**ultimos)
        print(f"Datos validados users: {datos_user_actualizados}")
    except ValidationError as e:
        print(f"Error de validación: {e.errors()}")
        return web.json_response({"error": "Datos inválidos", "detail": e.errors()}, status=400)

    empleados, users = leer_empleados(), leer_users()["users"]
    empleado_index = next((i for i, e in enumerate(empleados) if e['id'] == empleado_id), None)
    users_index = next((i for i, u in enumerate(users) if u['empleado_id'] == empleado_id), None)
    if empleado_index is None:
        print(f"Empleado {empleado_id} no encontrado.")
        return web.json_response({'message': 'Empleado no encontrado'}, status=404)
    
    if users_index is None:
        print(f"User con id {empleado_id} no encontrado.")
        return web.json_response({'message': 'Empleado no encontrado'}, status=404)

    empleado_actual = empleados[empleado_index]
    user_actual = users[users_index]

    if datos_actualizados.tareas_asignadas is not None:
        print(f"Tareas a actualizar: {datos_actualizados.tareas_asignadas}")
        if "tareas_asignadas" not in empleado_actual:
            empleado_actual["tareas_asignadas"] = {dia: [] for dia in DIAS_SEMANA}

        for dia, tareas in datos_actualizados.tareas_asignadas.items():
            if dia in DIAS_SEMANA:
                print(f"Procesando tareas para el día: {dia}")
                if dia not in empleado_actual["tareas_asignadas"]:
                    empleado_actual["tareas_asignadas"][dia] = []

                tareas_existentes = {t["id"]: t for t in empleado_actual["tareas_asignadas"][dia]}

                for tarea_data in tareas:
                    try:
                        print(f"Procesando tarea: {tarea_data}")

                        if isinstance(tarea_data, TareaSchema):
                            tarea_dict = tarea_data.model_dump()
                        else:
                            tarea_dict = TareaSchema(**tarea_data).model_dump()

                        if tarea_dict['id'] is None:
                            max_id = max((task["id"] for task in empleado_actual["tareas_asignadas"][dia]), default=0)
                            tarea_dict['id'] = max_id + 1

                        if tarea_dict["id"] in tareas_existentes:
                            print(f"Actualizando tarea existente con id {tarea_dict['id']}")
                            tareas_existentes[tarea_dict["id"]].update(
                                {k: v for k, v in tarea_dict.items() if v is not None}
                            )
                        else:
                            print(f"Agregando nueva tarea con id {tarea_dict['id']}")
                            empleado_actual["tareas_asignadas"][dia].append(tarea_dict)

                    except ValidationError as e:
                        print(f"Error de validación en la tarea: {e.errors()}")
                        return web.json_response({"error": "Tarea con campos no válidos", "detail": e.errors()}, status=400)

    # Actualizar el resto de datos del empleado si no se sinsertan tareas
    empleado_actual.update({k: v for k, v in datos_actualizados.model_dump(exclude_none=True).items() if k != "tareas_asignadas"})
    #print(f"Empleado actualizado: {empleado_actual}")
    user_actual.update(datos_user_actualizados.model_dump(exclude_none=True))
    #print(f"user actualizado: {user_actual}")

    guardar_empleados(empleados)
    guardar_users(users)
    print("Users y empleados guardados después de la actualización.")

    return web.json_response({'message': 'Empleado actualizado correctamente', 'empleado': [empleado_actual, user_actual] })


