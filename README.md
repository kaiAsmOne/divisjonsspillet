# Divisjonsspillet

Et enkelt webspill for å øve på oppstilt divisjon (long division), samme
metode som vist i "465 : 3 = 155" med mellomregningene -3, 16, -15, 15.

## Kjøre appen

```
pip install -r requirements.txt
python app.py
```

Åpne deretter http://localhost:5000 i nettleseren.

## Hvordan det fungerer

- Appen lager tilfeldige oppgaver: 3-sifret tall delt på et ensifret tall
  (2-9), alltid uten rest, og med samme vanskelighetsgrad som eksempelet.
- Du løser oppgaven ett steg av gangen, akkurat som på skolen: du henter
  ned ett og ett siffer og finner kvotientsifferet for hvert steg.
- Riktig steg gir tilbakemelding med en gang og du går videre til neste
  steg. Løser du hele oppgaven riktig får du 10 poeng.
- Svarer du feil på et steg, vises hele fasiten med alle mellomregningene
  (akkurat som oppstillingen med -3, 16, -15, 15), slik at man kan se
  riktig fremgangsmåte.
- Poengsum, antall riktige/feil og poengrekke (streak) vises øverst.

## Filstruktur

- `app.py` – Flask-backend som genererer oppgaver og regner ut alle steg
- `templates/index.html` – siden
- `static/style.css` – styling (notatbok-aktig oppsett)
- `static/script.js` – spillogikk i nettleseren (henter oppgaver, sjekker svar)

## Justere vanskelighetsgrad

I `app.py`, funksjonen `generate_problem()`:
- `divisor = random.randint(2, 9)` — endre området for divisor
- `quotient = random.randint(100, 999)` — endre området for kvotienten
  (og dermed dividendens størrelse)
