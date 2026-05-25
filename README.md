# Dětské oblečení podle počasí

Rodinná PWA aplikace: každé ráno zobrazí, co si mají děti obléct podle aktuální předpovědi počasí.

## Funkce

- Předpověď počasí přes [Open-Meteo](https://open-meteo.com/) (zdarma, bez API klíče)
- Doporučení oblečení pro kluka a holku zvlášť
- Zohledňuje teplotu, déšť, vítr, sníh a UV index
- Uložení jmen dětí v prohlížeči (localStorage)
- Funguje jako PWA (lze přidat na plochu mobilu)

## Spuštění

```bash
npm install
npm run dev
```

## Technologie

- React 19 + TypeScript + Vite
- Open-Meteo API – zdroj předpovědi počasí

## Plánované rozšíření

- **Netatmo integrace** – zobrazení lokálního měření z vlastní meteostanice přes backend endpoint (`api/netatmo/current.js`). Zatím není aktivní, kód je připraven.

## Nasazení

Aplikace je nasazena na [Vercel](https://vercel.com/). Vercel serverless funkce jsou ve složce `api/`.
