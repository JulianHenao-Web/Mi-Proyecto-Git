# Pixel Calc

Calculadora web de estilo pixel art oscuro con API HTTP para suma, resta, multiplicación y división. No requiere dependencias externas; usa Node.js 20 o superior.

## Ejecutar

```sh
npm start
```

Abre [http://localhost:3000](http://localhost:3000). Para desarrollo con reinicio automático: `npm run dev`.

## API

`POST /api/calculate` recibe JSON con dos operandos numéricos y una operación (`+`, `-`, `*` o `/`):

```json
{"left": 12, "right": 4, "operator": "/"}
```

La respuesta correcta es `{"result": 3}`. Los datos inválidos y la división entre cero devuelven HTTP 400 con un mensaje en `error`.

## Pruebas

```sh
npm test
```