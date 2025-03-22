from aiohttp import web, WSMsgType
import aiohttp_cors  # CORS para permitir conexiones externas
import os
import json
from Funciones.auth import login, login_post, logout
from Funciones.empleados import empleados, empleado_id, crear_empleado, eliminar_empleado, actualizar_empleado, users_id
from Funciones.tareas import tareas, tareas_dia
#comando para correr de manera recursiva (instalar dependencias de watchdog)
#watchmedo auto-restart --pattern="*.py" --recursive -- python app.py
websockets = set()
connected_clients = []

async def websocket_handler(request):
    ws = web.WebSocketResponse(protocols=['arduino'])
    await ws.prepare(request)
    websockets.add(ws)
    connected_clients.append(ws)
    print("Cliente WebSocket conectado")

    try:
        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                print(f"Mensaje recibido desde el servidor xdxd: {msg.data}")
                mensaje = json.loads(msg.data)
                await enviar_a_todos(mensaje)
                # Enviar respuesta a todos los clientes conectados
                for socket in websockets:
                    await socket.send_str(f"Echo: {msg.data}")

            elif msg.type == WSMsgType.ERROR:
                print(f"Error en WebSocket: {ws.exception()}")

    finally:
        # Remover cliente WebSocket cuando se desconecte
        websockets.remove(ws)
        print("Cliente WebSocket desconectado")
        if ws in connected_clients:
            connected_clients.remove(ws)
            print('Cliente desconectado')

    return ws

async def home(request):
    raise web.HTTPFound('/login')

async def inicio(request):
    return web.FileResponse('./web/Home/home.html')

async def general(request):
    return web.FileResponse('./web/General/general.html')

async def gestion(request):
    return web.FileResponse('./web/gestion/gestion.html')

async def informes (request):    
    return web.FileResponse('./web/informes/informes.html')

# Nueva función para servir empleados.json
async def obtener_json(request):
    json_path = os.path.join(os.getcwd(), 'empleados.json')
    if os.path.exists(json_path):
        return web.FileResponse(json_path)
    return web.Response(status=404, text="Archivo empleados.json no encontrado.")


#------------funcion de relojes y websockets--------------------

async def enviar_a_todos(mensaje):
    # Convertir el mensaje a una cadena JSON antes de enviarlo
    mensaje_str = json.dumps(mensaje)
    for client in connected_clients:
        if not client.closed:
            await client.send_str(mensaje_str)

    


app = web.Application()

app.router.add_get('/', home)
app.router.add_get('/inicio', inicio)
app.router.add_get('/login', login)
app.router.add_post('/login', login_post)
app.router.add_get('/logout', logout)
app.router.add_get('/gestion', gestion)
app.router.add_get('/informes', informes)
app.router.add_get('/general', general)

app.router.add_get('/empleados', empleados)
app.router.add_get('/empleados/{id}', empleado_id)
app.router.add_get('/user/{id}', users_id)
app.router.add_post('/empleados', crear_empleado)
app.router.add_delete('/empleados/{id}', eliminar_empleado)
app.router.add_patch('/empleados/{id}', actualizar_empleado)
#app.router.add_post('/subir-imagen', subir_imagen)


app.router.add_get('/tareas', tareas)
app.router.add_get('/tareas/{id}/{dia}', tareas_dia)
app.router.add_get('/empleados.json', obtener_json)

# Nueva ruta WebSocket
app.router.add_get('/ws', websocket_handler)

# Servir archivos estaticos
app.router.add_static('/web', path='./web', name='web')


#  CORS
cors = aiohttp_cors.setup(app, defaults={
    "*": aiohttp_cors.ResourceOptions(
        allow_credentials=True,
        expose_headers="*",
        allow_headers="*",
    )
})

# Agregar CORS a todas las rutas
for route in list(app.router.routes()):
    cors.add(route)

if __name__ == "__main__":
    web.run_app(app, host="0.0.0.0", port=2298)
