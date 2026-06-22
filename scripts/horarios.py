import json
#Mini script para transformar la data en un json con cada sala y su ocupacion por modulo


#La fuente es el json original con toda la informacion de los cursos

with open("files/2025-2.json", "r") as f:
    data = json.load(f)

k = list(data.keys())

modulos = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'j1', 'j2', 'j3', 'j4', 'j5', 'j6', 'j7', 'j8', 'j9', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9']
salas = {
    "San Joaquin": set(),
    "Lo Contador": set(),
    "Casa Central": set(),
    "Oriente": set(),
    "Campus Externo": set(),
    "Villarrica": set()
}

'''
sala: {
    modulo: [cursos/empty]
}
'''
horario_por_sala = {}


#Obtener salas
for sigle in k:
    i = 1
    while True:
        if not data[sigle]["sections"].get(str(i)):
            break
        
        for module in modulos:
            campus = data[sigle]["sections"][str(i)]["campus"]
            if campus == "San Joaqu\u00edn" or campus == "San Joaquín":
                campus = "San Joaquin"
            if data[sigle]["sections"][str(i)]["schedule"].get(module):
                salas[campus].add(data[sigle]["sections"][str(i)]["schedule"].get(module)[1])
        i += 1



#Crear placeholder de horarios_por_sala
for campus in salas.keys():
    for sala in salas[campus]:
        if sala == "" or sala == "SIN SALA":
            continue
        if not horario_por_sala.get(campus):
            horario_por_sala[campus] = {}
        horario_por_sala[campus][sala] = {}
        for module in modulos:
            horario_por_sala[campus][sala][module] = []

#Agregar modulos por sala y su curso
for sigle in k:
    i = 1
    while True:
        if not data[sigle]["sections"].get(str(i)):
            break
        
        for module in modulos:
            if data[sigle]["sections"][str(i)]["schedule"].get(module) and data[sigle]["sections"][str(i)]["schedule"].get(module)[1] != "":
                sala = data[sigle]["sections"][str(i)]["schedule"].get(module)[1]
                campus = data[sigle]["sections"][str(i)]["campus"]
                if campus == "San Joaqu\u00edn" or campus == "San Joaquín":
                    campus = "San Joaquin"
                if sala == "SIN SALA":
                    continue
                
                modulo_actual = horario_por_sala[campus][sala][module]
                sigla_en_modulo = False
                for sigla in horario_por_sala[campus][sala][module]:
                    if sigla[0] == sigle:
                        sigla_en_modulo = True
                
                #Validar colisiones e inconsistencias, si existen solo se loggea ya que es problema de la fuente original
                if modulo_actual and not sigla_en_modulo:
                    print(
                    sigle,
                    horario_por_sala[campus][sala][module],
                    sala,
                    module,
                    data[sigle]["sections"][str(i)]["schedule"][module]
                    )

                horario_por_sala[campus][sala][module].append([sigle, i])  
        i += 1


with open("./files/result.json", "w") as f:
    json.dump(horario_por_sala, f, indent=2)