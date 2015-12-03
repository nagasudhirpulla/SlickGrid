//Table Utility Functions
function showhide(el) {
    //Toggle Display button for the table
    var div = findSibling(el, "hidingClass");
    if (div.style.display !== "none") {
        div.style.display = "none";
    } else {
        div.style.display = "block";
    }
}

//Table Utility Functions
function findSibling(el, cls) {
    while (!el.classList.contains(cls)) {
        el = el.nextElementSibling;
    }
    return el;
}