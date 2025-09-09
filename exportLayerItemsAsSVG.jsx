// Export each top-level item in the active layer as SVG,
// preserving artboard size and exact global position.
function exportLayerItemsAsSVG() {
    if (app.documents.length === 0) { alert("No document open."); return; }

    var srcDoc = app.activeDocument;
    var abIndex = srcDoc.artboards.getActiveArtboardIndex();
    var srcAB = srcDoc.artboards[abIndex].artboardRect;
    var layer = srcDoc.activeLayer;
    var outFolder = Folder.selectDialog("Choose export folder");
    if (!outFolder) return;

    // Unlock & unhide everything in layer
    for (var j = 0; j < layer.pageItems.length; j++) {
        layer.pageItems[j].hidden = false;
        layer.pageItems[j].locked = false;
    }

    for (var i = 0; i < layer.pageItems.length; i++) {
        var item = layer.pageItems[i];

        // Record original position
        var b = item.geometricBounds; // [left, top, right, bottom]

        // Create new document same artboard size
        var tmp = app.documents.add(
            DocumentColorSpace.RGB,
            srcAB[2] - srcAB[0],   // width
            srcAB[1] - srcAB[3]    // height
        );
        tmp.artboards[0].artboardRect = srcAB;

        // Duplicate the item
        var dup = item.duplicate(tmp.layers[0], ElementPlacement.PLACEATBEGINNING);

        // Move duplicated item so its top-left matches original coords
        var dupB = dup.geometricBounds;
        var dx = b[0] - dupB[0];
        var dy = b[1] - dupB[1];
        dup.translate(dx, dy);

        // File name
        var base = (i + 1) + "_item";
        var file = new File(outFolder.fsName + "/" + base + ".svg");

        // Export
        var opts = new ExportOptionsSVG();
        opts.embedRasterImages = true;
        opts.fontSubsetting = SVGFontSubsetting.GLYPHSUSED;
        try { opts.coordinatePrecision = 3; } catch (e) {}

        tmp.exportFile(file, ExportType.SVG, opts);
        tmp.close(SaveOptions.DONOTSAVECHANGES);
    }

    alert("Export finished!");
}

exportLayerItemsAsSVG();
