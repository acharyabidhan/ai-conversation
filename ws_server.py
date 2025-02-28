import asyncio
import websockets

connected_clients = set()

async def handle_client(websocket, path):
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            for client in connected_clients:
                if client != websocket:
                    try:
                        await client.send(message)
                    except:
                        connected_clients.remove(client)
    except:
        pass
    finally:
        connected_clients.remove(websocket)

start_server = websockets.serve(handle_client, "localhost", 8765)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
