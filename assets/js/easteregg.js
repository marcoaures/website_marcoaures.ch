const quotes = [
  "Richte deiner Katze «Psst psst psst» von mir aus.",

  "Yeah, the website is a mess, but bear in mind my degree is literally in theater and cultural studies.",

  `Me: Mom, can we get web development?
Mom: No, we have web development at home.
The Web development at home:`,

  "Flowers are blooming in Antarctica...",

  "Hat dir heute schon jemand gesagt, dass du fantastisch aussiehst?",

  `Hallo Andi!
Also der Name is hardcodiert, aber falls du wirklich Andi heisst, warst du jetzt einen Moment überrascht, oder?`,

  "Glückwunsch, du hast eines von drei Easter Eggs auf der Webseite gefunden!",

  "Eintrag 1 von 437: Seite neu laden für eine andere Nachricht.",

  "Does Mark Zuckerberg dream of electric sheep?",

  "Mal ganz unter uns: Ich mag Elon Musk nicht.",

  "Bürojobs sind ein bisschen wie LAN-Parties ohne Pizza und Spiele.",

  `«Der Boden ist Lava»
-Einwohner von Pompeji, ca. 79 n. Chr.`,

  `Bayerischer Erdäpfelsalat:

- 1kg festkochende Kartoffeln
- 3 Zwiebeln
- 250 ml Gemüsebrühe
- 6 Esslöffel Weissweinessig
- 4 Esslöffel Öl
- Frische Petersilie
- Gewürfelte Essiggurken nach Wunsch

1. Kartoffeln in Salzwasser kochen und anschliessend schälen und in Scheiben schneiden.
2. Gemüsebrühe vorbereiten, Zwiebeln und Essiggurken währenddessen würfeln, Petersilie hacken.
3. Kartoffeln, Zwiebeln und Essiggurken mischen und stückweise mit Gemüsebrühe und Essig übergiessen. Die Kartoffeln sollten noch ein bisschen warm sein. Immer warten bis die Flüssigkeit ein bisschen eingezogen ist.
4. Öl dazugeben und alles rühren.
5. Mindestens eine halbe Stunde ruhen lassen, dann mit Pfeffer und Salz würzen.`,

  "Servus! Öfter hier? 😊",

  `Sie liebt mich
*Beisst ein Stück vom Burger ab*
Sie liebt mich nicht
*Beisst ein Stück vom Burger ab*
Sie liebt mich`,

  `Halte dich nie mit deiner Meinung zurück.
Es gibt buchstäblich Menschen die bei den Fragen auf Galaxus «Weiss ich nicht» kommentieren.`,

  "Der offizielle Staatsdinosaurier von Iowa ist der T-Rex.",

  "Die Lage in den USA ist so chaotisch, dass man fast meinen könnte, dass sie das Land auf einem Indianerfriedhof aufgebaut haben...",

  `«Eine Packung Tortellini waren letztes mal zu wenig, zwei waren zu viel. Also mach ich dieses mal doch am besten... drei»
-Ich, regelmässig`,

  "Fun Cultural Studies Facts: Denkt mal drüber nach, weshalb Radioaktivität in US-Filmen Superhelden erschafft und in japanischen Filmen Godzilla...",

  "Ich bin mir zu 80% sicher, dass in der Wohnung über mir ein tollwütiger Dachs mit einer Schlagbohrmaschine wohnt.",

  "Was hat 3 Buchstaben, manchmal 8 Buchstaben, aber niemals 7 Buchstaben.",

  "If the multiverse theory is correct, there's a universe out there where BOGO sort works perfectly every time and nobody can figure out why",

  "Als Herr Bilbo Beutlin von Beutelsend ankündigte, dass er demnächst zur Feier seines einundelfzigsten Geburtstages ein besonders prächtiges Fest geben wolle, war des Geredes und der Aufregung in Hobbingen kein Ende.",

  "So long and thanks for all the fish.",

  `Warrior: «I swear I will avenge the death of my brother!»
Elf: «You have my bow!»
Dwarf: «And my axe!»
Palading: «And my sword!»
Necromancer: «And your dead brother!»`,

  "Is this Folk Punk?",

  "Six seasons and a movie!",

  `«Was wollen wir?»
«Zeitreisen!»
«Und wann wollen wir es?»
«Irrelevant!»`,

  "Unexpected item in bagging area.",
  
  "Ja, mei...",

  "The Reaper is sailing for Mars and he calls for an Iron Rain!",  
  
  "Ruin a developers day, chose the username «null»",
  
  "Soooo... Irgendwelche Pläne dieses Wochenende?",

  "I bless the rains down in Africa",
  
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",

  "Press Win+V instead of Ctrl+V - Thank me later",
  
  "Thank God for cats!",
  
  "«What people say, what people do, and what they say they do, are entirely different things» - Google Analytics",
  
  `Paste this into console for fun:
document.body.style.transition = "transform 2s";
document.body.style.transform = "rotate(360deg)";`,

  "When I grow up I wanna be a Werner Herzog :)",
  
  `CARL! This is an outrage!`,

  "Read Enshittification by Cory Doctorow",
  
  "If this print-statement exists, you're in the wrong universe",
  
  "Free Palestine!",
  
  "[Read in Werner Herzog Voice]: Unburdened by conscious, he is free. And yet the Hamburglar is a prisoner of his own desire",
  
  "This time I'm mistaken for handing you a hog worth crankin or whatever Nickleback sang",

  `Medieval Lady: «... and I want armour for the cat»
Painter: «..but Milady~»
Medieval Lady: «I SAID ARMOUR FOR THE CAT»
https://pbs.twimg.com/media/GPO9IZIaMAAuhwI?format=jpg
`,


  `For the official localization of this website in cat, run this console command:
document.body.querySelectorAll('*').forEach(e=>e.childNodes.forEach(n=>n.nodeType==3&&n.nodeValue.trim()&&(n.nodeValue=n.nodeValue.replace(/\\p{L}+/gu,'miau'))))`,

  "The cursed item (Google Ads UI) is draining my mana (will to live) again"
];

const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
console.log(randomQuote);