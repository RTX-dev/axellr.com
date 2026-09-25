/* ============================================================
   Portfolio v2 — le moteur du terminal.
   Aucune dépendance. La sortie n'est construite qu'avec du
   contenu statique écrit ci-dessous ; ce que l'utilisateur
   tape est toujours inséré en textContent, jamais en HTML.
   Seule exception : `ipconfig`, qui interroge api.ipify.org
   pour afficher l'ip publique du visiteur — rien n'est stocké.
   ============================================================ */

(function () {
  "use strict";

  var out = document.getElementById("termOut");
  var input = document.getElementById("termInput");
  var scroll = document.getElementById("termScroll");

  var bootTime = Date.now();
  var history = [];
  var histPos = -1;

  var PROMPT = "axel@leroy:~$";

  /* ---------- primitives de sortie ---------- */

  function line(text, cls) {
    var el = document.createElement("div");
    el.className = "ln" + (cls ? " " + cls : "");
    el.textContent = text;
    out.appendChild(el);
    return el;
  }

  function blank() {
    line("");
  }

  function lines(arr, cls) {
    arr.forEach(function (t) { line(t, cls); });
  }

  /* lien dans une ligne : "texte" cliquable + note en gris */
  function linkLine(label, href, note, external) {
    var el = document.createElement("div");
    el.className = "ln";
    var a = document.createElement("a");
    a.href = href;
    a.textContent = label;
    if (external) { a.target = "_blank"; a.rel = "noopener"; }
    el.appendChild(a);
    if (note) {
      var s = document.createElement("span");
      s.className = "muted";
      s.textContent = " " + note;
      el.appendChild(s);
    }
    out.appendChild(el);
  }

  /* echo de la commande saisie, avec l'invite en vermillon */
  function echo(cmd) {
    var el = document.createElement("div");
    el.className = "ln";
    var p = document.createElement("span");
    p.className = "prompt";
    p.textContent = PROMPT + " ";
    el.appendChild(p);
    el.appendChild(document.createTextNode(cmd));
    out.appendChild(el);
  }

  function scrollBottom() {
    scroll.scrollTop = scroll.scrollHeight;
  }

  /* ---------- bannière ASCII, assemblée lettre par lettre ---------- */

  var FONT = {
    A: [" █████╗ ", "██╔══██╗", "███████║", "██╔══██║", "██║  ██║", "╚═╝  ╚═╝"],
    X: ["██╗  ██╗", "╚██╗██╔╝", " ╚███╔╝ ", " ██╔██╗", "██╔╝ ██╗", "╚═╝  ╚═╝"],
    E: ["███████╗", "██╔════╝", "█████╗  ", "██╔══╝  ", "███████╗", "╚══════╝"],
    L: ["██╗     ", "██║     ", "██║     ", "██║     ", "███████╗", "╚══════╝"],
    R: ["██████╗ ", "██╔══██╗", "█████╔╝ ", "██╔══╝  ", "██║     ", "╚═╝     "],
    O: [" ██████╗ ", "██╔═══██╗", "██║   ██║", "██║   ██║", " ╚█████╔╝", "  ╚════╝ "],
    Y: ["██╗   ██╗", "╚██╗ ██╔╝", " ╚████╔╝ ", "  ╚██╔╝  ", "   ██║   ", "   ╚═╝   "],
    " ": ["  ", "  ", "  ", "  ", "  ", "  "]
  };

  function banner(word) {
    var rows = ["", "", "", "", "", ""];
    word.split("").forEach(function (ch) {
      var g = FONT[ch] || FONT[" "];
      for (var i = 0; i < 6; i++) rows[i] += g[i];
    });
    return rows.join("\n");
  }

  /* ---------- données (tout vient de la v1, rien d'inventé) ---------- */

  var PROJECTS = {
    "portfolio": {
      num: "p—01",
      title: "portfolio",
      tags: "react · html · css",
      desc: "mon premier portfolio, en react. la version graphique,\n" +
            "celle que vous pouvez ouvrir depuis ce terminal, en est la\n" +
            "refonte — écrite à la main, sans la moindre dépendance.",
      url: "https://axellr.netlify.app",
      urlLabel: "axellr.netlify.app"
    },
    "ia": {
      num: "p—02",
      title: "agent ia — ollama",
      tags: "python · ollama · ia",
      desc: "un agent qui donne des conseils de conduite à partir de\n" +
            "données utilisateur : preprocessing, prompt, tests\n" +
            "d'utilisabilité. fait pendant mon stage chez lery.",
      url: "https://gitlab.com/axellr",
      urlLabel: "gitlab.com/axellr",
      alias: "ollama"
    },
    "natation": {
      num: "p—03",
      title: "suivi sportif — natation",
      tags: "web · gestion · sport",
      desc: "application de suivi sportif avec gestion des programmes\n" +
            "d'entraînement. un projet perso, utile d'abord pour\n" +
            "celui qui le code.",
      url: "https://github.com/RTX-dev/app_natation_axell",
      urlLabel: "github.com/RTX-dev/app_natation_axell"
    },
    "discord": {
      num: "p—04",
      title: "bot discord",
      tags: "javascript · node.js · api",
      desc: "bot multi-fonctionnel pour la gestion et la modération de\n" +
            "serveurs : commandes personnalisées, système de logs,\n" +
            "automatisation.",
      url: "https://github.com/RTX-dev/bot-discord",
      urlLabel: "github.com/RTX-dev/bot-discord"
    },
    "medical": {
      num: "p—05",
      title: "module erp — produits médicaux",
      tags: "php · windows server · gpo",
      desc: "module d'un erp gérant les bons de commande d'envoi pour\n" +
            "un hôpital, déployé pendant mon stage, avec mise en place\n" +
            "de gpo. pas glamour, mais réel — et en production.",
      url: "https://github.com/RTX-dev/erp-axel",
      urlLabel: "github.com/RTX-dev/erp-axel",
      alias: "hopital"
    }
  };

  function findProject(name) {
    for (var key in PROJECTS) {
      if (key === name || (PROJECTS[key].alias && PROJECTS[key].alias === name)) {
        return PROJECTS[key];
      }
    }
    return null;
  }

  var FILES = {
    "about.md": "whoami",
    "parcours.md": "parcours",
    "skills": "skills",
    "contact.md": "contact",
    "certs.md": "certs"
  };

  /* ---------- commandes ---------- */

  var COMMANDS = {

    help: function () {
      lines([
        "commandes disponibles :",
        "",
        "  help          cette liste",
        "  whoami        à propos d'axel (alias : about)",
        "  parcours      formation & stages (alias : formation)",
        "  skills        l'arborescence des compétences (alias : competences)",
        "  projects      la liste des projets (alias : projets)",
        "  cat <nom>     détail d'un projet ou d'un fichier",
        "  cowsay <txt>  la vache qui dit ce que vous voulez",
        "  certs         certifications cisco",
        "  contact       email & réseaux",
        "  graphique     la version classique du portfolio",
        "  clear         nettoie l'écran (ou ctrl+l)",
        "",
        "et puis date, uptime, ipconfig, history, neofetch… le folklore du terminal."
      ]);
    },

    whoami: function () {
      lines([
        "axel leroy — étudiant en l2 informatique, brest (ubo).",
        "linux user : du back-end au front, avec un faible pour",
        "les systèmes, les réseaux et la sécurité.",
        "hors code : salle de sport, écran de jeu, volant."
      ]);
    },

    parcours: function () {
      lines([
        "2025 — en cours    licence informatique l2 — ubo, brest",
        "                   algorithmique, poo, bases de données, systèmes",
        "",
        "2024 — 2025        stage dev php — lery technologie (lery.cc),",
        "                   cesson-sévigné",
        "                   laravel & mysql, composants réutilisables,",
        "                   formulaire de contact, agent ia branché sur ollama",
        "",
        "2024 — 2025        stage support info — b2impact (www.b2-impact.fr),",
        "                   landerneau",
        "                   support n1/n2 : windows, glpi, gpo, et l'application",
        "                   de gestion de produits médicaux",
        "",
        "2023 — 2025        bts sio option slam — aftec, rennes",
        "                   développement d'applications. épreuve e5 validée,",
        "                   session 2025",
        "",
        "2019 — 2022        bac pro systèmes numériques",
        "                   réseaux informatiques et électronique. c'est là que",
        "                   tout a commencé."
      ]);
    },

    skills: function () {
      lines([
        "axel.skills/",
        "├── developpement/       javascript · php · python · html-css · sql",
        "├── frameworks-outils/   laravel (préféré) · react · node.js · git · docker",
        "├── bases-de-donnees/    mysql · modélisation mcd/mld · requêtes",
        "└── systemes-reseaux/    linux · windows server · glpi · gpo · cybersécurité (en cours)"
      ]);
    },

    projects: function () {
      lines([
        "p—01  portfolio                 react, html, css",
        "p—02  agent ia — ollama         python, ollama",
        "p—03  suivi natation            web, gestion",
        "p—04  bot discord               javascript, node.js",
        "p—05  module erp — médical     php, windows server, gpo",
        "",
        "détail d'un projet : cat <nom> — ex : cat discord",
        "noms courts : portfolio, ia, natation, discord, medical"
      ]);
    },

    certs: function () {
      lines([
        "certifications — cisco networking academy :",
        "  [x] networking basics",
        "  [x] networking devices & basic configuration",
        "  [x] network addressing & basic troubleshooting"
      ]);
    },

    contact: function () {
      lines(["pour un stage, un projet, ou juste une question :"]);
      linkLine("axell29@protonmail.com", "mailto:axell29@protonmail.com", "← email");
      linkLine("github.com/RTX-dev", "https://github.com/RTX-dev", "← code", true);
      linkLine("linkedin.com/in/axel-leroy-it", "https://linkedin.com/in/axel-leroy-it", "← profil", true);
      linkLine("gitlab.com/axellr", "https://gitlab.com/axellr", "← aussi là", true);
      blank();
      line("(version graphique du portfolio : `graphique`)", "muted");
    },

    graphique: function () {
      lines(["ouverture de la version graphique…", ""]);
      linkLine("← portfolio — index.html", "../index.html");
      line("si le lien ne s'ouvre pas tout seul, cliquez ci-dessus.", "muted");
    },

    ls: function () {
      lines(["about.md    parcours.md    skills/    projects/    contact.md    certs.md"]);
    },

    date: function () {
      line(new Date().toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "medium" }));
    },

    ipconfig: function () {
      line("interrogation de api.ipify.org…", "muted");
      fetch("https://api.ipify.org?format=json")
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var nav = "inconnu";
          var ua = navigator.userAgent;
          if (/edg/i.test(ua)) nav = "edge";
          else if (/chrome/i.test(ua)) nav = "chrome";
          else if (/firefox/i.test(ua)) nav = "firefox";
          else if (/safari/i.test(ua)) nav = "safari";
          lines([
            "carte réseau eth0 (votre navigateur) :",
            "",
            "  adresse ipv4 publique . . . : " + d.ip,
            "  navigateur  . . . . . . . . : " + nav,
            "  passerelle . . . . . . . . . : le cloud",
            "  dhcp . . . . . . . . . . . . : votre fai s'en occupe",
            "",
            "(vos données restent chez vous : rien n'est stocké ici)"
          ]);
        })
        .catch(function () {
          line("ipconfig : impossible de récupérer l'ip publique — hors ligne ?", "muted");
        });
    },

    uptime: function () {
      var s = Math.floor((Date.now() - bootTime) / 1000);
      var m = Math.floor(s / 60);
      s = s % 60;
      line("ce terminal tourne depuis " + m + " min " + s + " s — et la v1 depuis 2026.", "muted");
    },

    history: function () {
      if (!history.length) {
        line("l'historique est vide. commencez par `help`.", "muted");
        return;
      }
      history.forEach(function (h, i) {
        line("  " + (i + 1) + "  " + h);
      });
    },

    neofetch: function () {
      line(banner("AXEL"), "banner");
      lines([
        "axel@leroy",
        "──────────",
        "os        : linux (et un peu de windows server)",
        "host      : ubo, brest",
        "role      : étudiant l2 informatique — dev fullstack",
        "shell     : ce portfolio-ci",
        "langages  : php · js · python · sql · html-css",
        "réseaux   : 3 certifications cisco",
        "uptime    : depuis le bac pro 2019"
      ]);
    },

    clear: function () {
      out.innerHTML = "";
    }
  };

  /* alias */
  COMMANDS.about = COMMANDS.whoami;
  COMMANDS.formation = COMMANDS.parcours;
  COMMANDS.competences = COMMANDS.skills;
  COMMANDS.projets = COMMANDS.projects;
  COMMANDS.mail = COMMANDS.contact;
  COMMANDS.v1 = COMMANDS.graphique;
  COMMANDS.web = COMMANDS.graphique;
  COMMANDS.ip = COMMANDS.ipconfig;
  COMMANDS.ifconfig = COMMANDS.ipconfig;

  /* ---------- cat ---------- */

  function cat(arg) {
    if (!arg) {
      line("cat : nom manquant — essayez `projects` pour la liste.", "muted");
      return;
    }
    if (FILES[arg]) {
      COMMANDS[FILES[arg]]();
      return;
    }
    var p = findProject(arg);
    if (!p) {
      line("cat : " + arg + " : fichier ou projet introuvable", "muted");
      return;
    }
    line("── " + p.num + " · " + p.title + " " + "─".repeat(Math.max(2, 44 - p.title.length)), "accent");
    blank();
    lines(p.desc.split("\n"));
    blank();
    line("  stack : " + p.tags, "muted");
    out.appendChild((function () {
      var el = document.createElement("div");
      el.className = "ln";
      el.appendChild(document.createTextNode("  lien  : "));
      var a = document.createElement("a");
      a.href = p.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = p.urlLabel;
      el.appendChild(a);
      return el;
    })());
  }

  /* ---------- sudo (easter egg) ---------- */

  function sudo(rest) {
    lines([
      "[sudo] mot de passe pour recruteur : ********",
      "accès accordé."
    ]);
    blank();
    line("vous cherchez quelqu'un pour un stage ? bon réflexe :");
    linkLine("axell29@protonmail.com", "mailto:axell29@protonmail.com", "← écrivez-moi");
  }

  /* ---------- cowsay ---------- */

  function cowsay(text) {
    if (!text) text = "moo. tapez `cowsay <message>` pour me faire dire quelque chose.";

    /* retour à la ligne tous les 38 caractères, sans couper un mot */
    var max = 38;
    var rows = [];
    var cur = "";
    text.split(/\s+/).forEach(function (w) {
      if (cur && (cur + " " + w).length > max) { rows.push(cur); cur = w; }
      else { cur = cur ? cur + " " + w : w; }
    });
    if (cur) rows.push(cur);

    var width = 0;
    rows.forEach(function (r) { width = Math.max(width, r.length); });

    var bar = "─".repeat(width + 2);
    line(" " + bar);
    if (rows.length === 1) {
      line("< " + rows[0] + " >");
    } else {
      rows.forEach(function (r, i) {
        var left = i === 0 ? "/" : "|";
        var right = i === rows.length - 1 ? "\\" : "|";
        line(left + " " + r + " ".repeat(width - r.length) + " " + right);
      });
    }
    line(" " + bar);
    lines([
      "        \\   ^__^",
      "         \\  (oo)\\_______",
      "            (__)\\       )\\/\\",
      "                ||----w |",
      "                ||     ||"
    ]);
  }

  /* ---------- interpréteur ---------- */

  function run(cmdRaw) {
    var cmd = cmdRaw.trim();
    echo(cmd);
    if (cmd) {
      history.push(cmd);
      histPos = history.length;
      var parts = cmd.split(/\s+/);
      var name = parts[0].toLowerCase();
      var arg = parts.slice(1).join(" ");

      if (name === "sudo") {
        sudo(arg);
      } else if (name === "cowsay") {
        cowsay(arg);
      } else if (name === "cat") {
        cat(arg.toLowerCase());
      } else if (COMMANDS[name]) {
        COMMANDS[name]();
      } else {
        line("bash : " + name + " : commande introuvable", "muted");
        line("tapez `help` pour la liste des commandes.", "muted");
      }
    }
    blank();
    scrollBottom();
  }

  /* ---------- saisie : entrée, historique, complétion ---------- */

  function complete() {
    var value = input.value;
    var words = value.split(/\s+/);
    var last = words[words.length - 1];
    var pool;

    if (words.length > 1 && words[0].toLowerCase() === "cat") {
      pool = Object.keys(PROJECTS).concat(Object.keys(FILES));
    } else {
      pool = Object.keys(COMMANDS);
    }

    var matches = pool.filter(function (c) { return c.indexOf(last) === 0; });
    if (matches.length === 1) {
      words[words.length - 1] = matches[0];
      input.value = words.join(" ");
    } else if (matches.length > 1) {
      line(matches.join("  "), "muted");
      scrollBottom();
    }
  }

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      var v = input.value;
      input.value = "";
      run(v);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length && histPos > 0) {
        histPos--;
        input.value = history[histPos];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histPos < history.length - 1) {
        histPos++;
        input.value = history[histPos];
      } else {
        histPos = history.length;
        input.value = "";
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      COMMANDS.clear();
    }
  });

  /* un clic dans le terminal remet le focus sur la saisie */
  scroll.addEventListener("mouseup", function () {
    if (window.getSelection().toString() === "") {
      input.focus({ preventScroll: true });
    }
  });

  /* ---------- séquence de démarrage ---------- */

  line(
    "dernier login : " +
    new Date().toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" }) +
    " sur ttys001",
    "muted"
  );
  echo("./portfolio.sh");
  blank();
  line(banner("AXEL"), "banner");
  line("portfolio v2.0 — mode cli · axel leroy", "muted");
  blank();
  lines([
    "bienvenue sur le portfolio d'axel leroy, en mode terminal.",
    "tapez `help` pour la liste des commandes, ou flânez :",
    "whoami · parcours · skills · projects · cat discord · contact"
  ]);
  blank();
  linkLine("→ version graphique du portfolio", "../index.html", "(celle avec le vrai design)", false);
  blank();
  input.focus();
  scrollBottom();
})();
