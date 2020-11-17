import JSZip from "jszip";

export function downloadFile(filename: string, text: string, type: string = "text/plain", convert: boolean = true) {
    const element = document.createElement('a');
    let data = convert ? 'charset=utf-8,' + encodeURIComponent(text): text;
    element.setAttribute('href', 'data:' + type + ';' + data);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

export function downloadZip(files: { filename: string, text: string }[]) {
    const zip = new JSZip();
    files.forEach(file => {
        zip.file(file.filename, file.text);
    })
    zip.generateAsync({type:"base64"})
        .then(async function (content) {
            downloadFile("download.zip", "base64," + content, "application/zip", false)
        });
}
