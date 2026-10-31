F1 Race Intelligence website
============================
Run:   pip install flask   then   python app.py   ->  http://127.0.0.1:5000
(or just double-click index.html - it also works without Flask)

Tableau embeds
--------------
A .twb file can't be embedded directly. Publish both to Tableau Public
(Server > Tableau Public > Save to Tableau Public) and make them public, then
set the names at the top of static/js/main.js:

  dashboard: 'F1RACEINTELLIGENCEDASHBOARD/Dashboard3'
  story:     'F1RACEINTELLIGENCESTORY/Story1'

(taken from your demo video; copy the exact "name" value from Share > Embed Code).

Facts/drivers/champions come from static/js/data.js, generated from the Excel dataset.
