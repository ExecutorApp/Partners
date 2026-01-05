# Seletor de Hora (TimetableModal)

Este modal permite selecionar horas e minutos com rolagem vertical. O número azul central exibe o valor ativo. Em web e nativo, o comportamento de rolagem é consistente e compensa o padding superior/inferior.

## Comportamento

- Lista de horas: `00` a `23` (filtrada quando há `minTime`).
- Lista de minutos: `00` a `59`; se `hora === min.hour`, a lista começa em `min.minute`.
- O índice central é calculado por `(scrollY - TOP_PAD) / ITEM_HEIGHT`.
- Em web, o valor é atualizado durante a rolagem (`onScroll`) e confirmado também em `onScrollEndDrag`.
- O valor final é sempre validado por `clampToMin` e emitido no formato `HH:MM` (`formatTime`).

## Validações

- `isValidTime(HH:MM)` garante formato válido (00–23 para horas, 00–59 para minutos).
- `parseTime` retorna `{ hour, minute }` ou `null` se inválido.
- `clampToMin` assegura que o valor respeite `minTime` quando aplicável.

## Casos de teste relevantes

- Aceita `00:00` (não deve travar em web).
- Rejeita formatos fora do padrão (ex.: `24:00`, `12:60`).
- Respeita `minTime` para hora mínima e minuto mínimo.

## Uso

Importe utilitários de `src/utils/time` para validação/normalização de dados. Evite duplicar lógica em componentes.