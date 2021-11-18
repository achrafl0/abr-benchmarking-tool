import { Chart, registerables } from "chart.js";

let chart1 = null
let chart2 = null
Chart.register(...registerables);

const chartsElementIds = [{
        canvas: "chart-1",
        input: "file-1",
        button: "import-1",
        title: "title-chart-1",
        chart: chart1
    },
    {
        canvas: "chart-2",
        input: "file-2",
        button: "import-2",
        title: "title-chart-2",
        chart: chart2,
    }
]

for (let chart of chartsElementIds) {
    document.getElementById(chart.button).onclick = function() {
        const files = document.getElementById(chart.input).files;
        console.log(files)
        if (files.length <= 0) {
            window.alert("No file selected")
            return false;
        }
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            const { player, data } = JSON.parse(event.target.result)
            document.getElementById(chart.title).textContent = player
            chart.chart = new Chart(document.getElementById(chart.canvas), data);
        }
        fileReader.readAsText(files.item(0))
    }
}