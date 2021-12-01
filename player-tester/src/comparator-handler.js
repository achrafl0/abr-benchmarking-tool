import ChartManager from "./chart";

const chartContainerElt = document.getElementById("chart-containers");

document.getElementById("import").onclick = function() {
    const files = document.getElementById("file").files;
    console.log(files)
    if (files.length <= 0) {
        window.alert("No file selected")
        return false;
    }
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
        const data = JSON.parse(event.target.result)
        const chart = new ChartManager(data);
        chartContainerElt.appendChild(chart.canvas);
    }
    fileReader.readAsText(files.item(0))
}
