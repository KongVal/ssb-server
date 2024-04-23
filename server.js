// Oblig 2 Mikkel Kjelvik 230830
// Før kjøring:
// npm update
// npm install express axios

const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();

// Sett opp stier til HTML- og JavaScript-filer
const htmlPath = path.join(__dirname, 'tabell.html');
const jsPath = path.join(__dirname, 'tabell_script.js');

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(htmlPath); // Server HTML-filen ved rotstien
});

app.get('/tabell_script.js', (req, res) => {
    res.sendFile(jsPath); // Server JavaScript-filen
});

// Sender forespørsel til SSB API-et
app.get('/data', async (req, res) => {
    try {
        const kommuner = req.query.kommuner ? req.query.kommuner.split(',') : []; // Definerer 'kommuner' og 'år' basert på resultat av spørringen
        const år = req.query.år ? req.query.år.split(',') : []; // Tidligere hardkodet standardverdi, er nå uspesifisert "[]"

        console.log('Kommuner:', kommuner); // Logging for å sjekke kommunene
        console.log('År:', år); // Logging for å sjekke årene

        const response = await axios.post('https://data.ssb.no/api/v0/no/table/11342', { // Hvor (URL) vi sender forespørselen
            query: [ // Selve spørringen
                {
                    code: "Region",
                    selection: {
                        filter: "vs:Kommune",
                        values: kommuner
                    }
                },
                {
                    code: "ContentsCode",
                    selection: {
                        filter: "item",
                        values: ["Folkemengde"]
                    }
                },
                {
                    code: "Tid",
                    selection: {
                        filter: "item",
                        values: år
                    }
                }
            ],
            response: { format: "json-stat2" }
        });

        // console.log('Respons fra SSB API-et:', response.data); // Logging av responsen fra SSB API-et hvis man vil se den i detalj

        // Tolker respons fra SSB API-et og definerer nødvendige variabler
        const data = hentBefolkningsdata(response.data);
        const gjennomsnitt = beregnGjennomsnitt(data);
        const median = beregnMedian(data);
        const maksimum = Math.max(...data);
        const minimum = Math.min(...data);

        // Hvis alt går som planlagt sendes dette videre til klienten
        res.json({ gjennomsnitt, median, maksimum, minimum });
    } catch (error) {
        console.error('Feil ved henting av data fra SSB API:', error);
        res.status(500).send('Feil ved henting av data fra SSB API');
    }
});

// Funksjon for å tolke responsen og hente ut de faktiske dataene
function hentBefolkningsdata(responseData) {
    return responseData.value;
}

// Funksjon for utregning av gjennomsnittet. Summerer valgte element og deler til slutt på antall valgte element.
function beregnGjennomsnitt(data) {
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
}

// Funksjon for å beregne medianen
function beregnMedian(data) {
    const sortedData = data.slice().sort((a, b) => a - b);
    const mid = Math.floor(sortedData.length / 2);
    if (sortedData.length % 2 === 0) {
        return (sortedData[mid - 1] + sortedData[mid]) / 2;
    } else {
        return sortedData[mid];
    }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server kjører på port ${port}`);
});
