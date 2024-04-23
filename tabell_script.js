document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dataForm');
    const selectedYear = document.getElementById('year');
    const selectedKommuner = document.getElementById('kommune');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Hindrer standard skjemainnsending

// Henter verdien av det valgte året fra HTML-skjemaet
const år = selectedYear.value;

// Henter alle de valgte kommunene fra HTML-skjemaet
const kommuner = Array.from(selectedKommuner.selectedOptions).map(option => option.value);


        try {
            const response = await fetch(`/data?år=${år}&kommuner=${kommuner.join(',')}`); // Sender forespørsel til serveren om år og kommuner
            const data = await response.json();

            // Begrens gjennomsnittet til to desimaler
            const gjennomsnittFormatted = data.gjennomsnitt.toFixed(2);

            // Oppdater tabellen med de mottatte dataene inkludert begrenset gjennomsnitt
            const tableBody = document.getElementById('table-body');
            tableBody.innerHTML = `
                <tr>
                    <td>${gjennomsnittFormatted}</td>
                    <td>${data.median}</td>
                    <td>${data.maksimum}</td>
                    <td>${data.minimum}</td>
                </tr>
            `;

            // Etter svar oppdateres tabellen. Må gjøres mer dynamisk
            const selectedKommunerText = kommuner.map(kommune => {
                switch (kommune) {
                    case '1505':
                        return 'Molde';
                    case '1506':
                        return 'Kristiansund';
                    case '1560':
                        return 'Tingvoll';
                    default:
                        return '';
                }
            }).join(', ');
            document.getElementById('valgteKommuner').textContent = `Valgte kommuner: ${selectedKommunerText}`;
        } catch (error) {
            console.error('Feil ved henting av data fra serveren:', error);
        }
    });
});
