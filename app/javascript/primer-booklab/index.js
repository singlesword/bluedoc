import "./autocomplete/index";
import "./select-menu/index";
import "./dialog/index";
import "./flash/index";
// import "./confirm/index";

document.addEventListener("turbolinks:before-cache", () => {
  $("details").removeAttr("open");
})