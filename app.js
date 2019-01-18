'use strict';
const hummus = require('hummus');
const memory_stream = require('memory-streams');
const fs = require('fs');
const express = require('express');
const app = express();

var combinePDFBuffers = function(first_buffer, second_buffer){
    var out_stream = new memory_stream.WritableStream();
    try{
        var first_stream = new hummus.PDFRStreamForBuffer(first_buffer);
        var second_stream = new hummus.PDFRStreamForBuffer(second_buffer);
        var writer = hummus.createWriterToModify(first_stream,new hummus.PDFStreamForResponse(out_stream));
        writer.appendPDFPagesFromPDF(second_stream);
        writer.end();
        var new_buffer = out_stream.toBuffer();
        out_stream.end();
        return new_buffer;
    }
    catch(e){
        out_stream.end();
        throw new Error('Error during PDF merge: ' + e.message);
    }
}

app.get('/pdf', function (req,res) {
    console.log('merge two PDF files');
    var pdf1 = fs.readFileSync('./test/PDF_1.pdf');
    var pdf2 = fs.readFileSync('./test/PDF_2.pdf');
    var merge_file = './test/merged.pdf';
    fs.writeFile(merge_file,combinePDFBuffers(pdf1,pdf2), function (err) {
        if (err)
            return console.log(err);
        var data =fs.readFileSync(merge_file);
        res.contentType("application/pdf");
        res.send(data);

        console.log('file saved successfully');
    });
})

app.listen(3000,function () {
    console.log('listening on port 3000');
})