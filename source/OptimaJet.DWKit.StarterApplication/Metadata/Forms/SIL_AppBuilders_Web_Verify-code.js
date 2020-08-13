{
    openWebArtifactLink: function({controlRef, parameters}){
        let selectedRow = controlRef.state.items[parameters.rowIdx];
        var link = selectedRow.Url;
        var win = window.open(link, '_blank');
        win.focus();
    }
}