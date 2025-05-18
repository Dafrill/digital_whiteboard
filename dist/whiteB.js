//pd ang teams-> grammar-> ex 29, 30
// to streamline- ulepszyć
//to downsize
// bez wykorzystania formatu csv
//nie importować trisolvera ani coloramy
//jeśli lista argumentu jest za duża, program nie może się wysypać

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
ctx.strokeStyle = "black";
ctx.lineWidth = 2; //0.8 the smallest
let rysowanie = false;

ctx.shadowBlur = 1;

const elements = document.querySelectorAll('[id^="bt"]');
const wheels = document.querySelectorAll('[id^="wheel"]');

// Pobieramy rzeczywiste rozmiary canvas
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let allowedToMove = false;
let allowedToDraw = false;
let allowedToErase = false;

const allows = [allowedToDraw, allowedToErase, allowedToMove];
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function rest(sec) {
  await sleep(sec);
}

canvas.addEventListener("resize", () => {
  document.querySelector(".no-zoom").style.transform = "scale(1)";
});

elements.forEach((element) => {
  console.log("Activating buttons");
  element.addEventListener("click", (event) => {
    console.log("a button has been clicked");

    allows.fill(false);
    if (element.id === event.target.id) {
      console.log(`Clicked ${event.target.id}`);
      switch (element.id) {
        default:
        //allows.fill(false);

        case "bt0": // move logic here
          //allowedToMove = true;
          allows[2] = true;

          console.log("dragging mode on, not allowed to draw");
          console.log(`Clicked bt0: Allowed to draw: ${allowedToDraw}`);
          const viewport = document.getElementById("viewport");
          const workspace = document.getElementById("workspace");

          let isDragging = false;

          console.log(ctx.strokeStyle);
          let startX, startY;
          let currentX = 10;
          let currentY = 10;

          // Zapisz pozycję do localStorage
          function savePosition() {
            localStorage.setItem("workspaceX", currentX);
            localStorage.setItem("workspaceY", currentY);
          }

          // Aktualizuj transformację na podstawie bieżących współrzędnych
          function updateTransform() {
            workspace.style.transform = `translate(-50%, -50%) translate(${currentX}px, ${currentY}px)`;
          }

          // Obsługa zdarzeń dla przeciągania
          viewport.addEventListener("mousedown", (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            viewport.classList.remove("grab");
            viewport.classList.add("grabbing");
          });

          viewport.addEventListener("mouseup", () => {
            if (isDragging && allows[2]) {
              isDragging = false;
              viewport.classList.remove("grabbing");
              viewport.classList.add("grab");
              savePosition(); // Zapisz pozycję po zakończeniu przeciągania
            }
          });

          viewport.addEventListener("mouseleave", () => {
            isDragging = false;
            viewport.classList.remove("grabbing");
            viewport.classList.add("grab");
          });

          viewport.addEventListener("mousemove", (e) => {
            console.log(`Last step: Allowed to draw: ${allowedToDraw}`);

            if (isDragging && allows[2]) {
              const dx = e.clientX - startX;
              const dy = e.clientY - startY;
              currentX += dx;
              currentY += dy;
              startX = e.clientX;
              startY = e.clientY;
              updateTransform();
            }
          });
          break;
        // Wczytaj pozycje podczas ładowania strony
        case "bt1":
        case "bt2":
          console.log(`Pen has been cliked: Allowed to move: ${allows[2]}`);

          allows[0] = true;
          console.log(`Allows[0] = ${allows[0]}`);
          if (allows[0]) {
            console.log("Drawing starts");
            canvas.addEventListener("mousedown", (event) => {
              rysowanie = true;

              ctx.beginPath();

              // Obliczanie skalowania
              const rect = canvas.getBoundingClientRect();
              const scaleX = canvasWidth / rect.width;
              const scaleY = canvasHeight / rect.height;

              // Prawidłowe pozycjonowanie kursora
              ctx.moveTo(
                (event.clientX - rect.left) * scaleX,
                (event.clientY - rect.top) * scaleY
              );
            });

            canvas.addEventListener("mouseup", () => {
              rysowanie = false;
            });
            window.addEventListener("message", (event) => {
              // event.data zawiera wiadomość wysłaną przez iframe
              //console.log("Otrzymano wiadomość z iframe:");
              if (event.data && event.data.id === "pen_color") {
                let newColor = String(event.data.data); // Poprawne odczytanie wartości
                ctx.strokeStyle = newColor;
              } else if (event.data && event.data.id === "pen_thickness") {
                let newThickness = parseInt(event.data.data);
                ctx.lineWidth = ((newThickness - 10) * 49) / 90 + 1;
              }
              //console.log("Otrzymano wiadomość z iframe:", event.data);
            });

            canvas.addEventListener("mousemove", (event) => {
              if (!rysowanie || !allows[0]) return;

              if (allows[0]) {
                ctx.shadowColor = ctx.strokeStyle;
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvasWidth / rect.width;
                const scaleY = canvasHeight / rect.height;

                const x = (event.clientX - rect.left) * scaleX;
                const y = (event.clientY - rect.top) * scaleY;

                ctx.lineCap = "round";

                let newColor = "";
                ctx.lineTo(x, y);
                ctx.stroke();
              }
            });
          }
          break;
        case "bt3":
          allows[1] = true;
          allows[0] = true;

          ctx.strokeStyle = "white";

          let setSize = document.getElementById("thickness");
          setSize.addEventListener("change", () => {
            if (allows[1]) {
              let inputValue = Number(setSize.value);
              ctx.lineWidth = inputValue - 10;
              updateCursor(ctx.lineWidth);
            }
          });

          break;
      }
    }
  });
});
// Funkcja zmieniająca tło elementu
function toggleBackgroundColor(element) {
  // Sprawdź aktualny kolor tła
  const currentColor = window.getComputedStyle(element).backgroundColor;

  // Zmień kolor na podstawie obecnego
  if (currentColor === "rgb(255, 255, 255)") {
    elements.forEach((element) => {
      element.style.backgroundColor = "white";
    });

    wheels.forEach((wheel) => {
      if (!wheel.classList.contains("hidden")) {
        //wyświetla kliknięty element
        wheel.classList.add("hidden");
        //ustawia wszystie inne iframy na ukryte
      }
      if (wheel.id.slice(-1) == element.id.slice(-1)) {
        wheel.classList.remove("hidden");
      }
    });

    // Kolor biały (rgb dla #FFFFFF)
    element.style.backgroundColor = "#DEDEDE"; // Zmieniamy na szary
  } else {
    element.style.backgroundColor = "white"; // Zmieniamy na biały
    allows.fill(false);
    //alert(allows);
    //alert(`all to draw: ${allowedToDraw}, all to move: ${allowedToMove}`);
    //console.log(allows);
    //console.log(
    //   ` color changed to white: Allowe to move: ${allowedToMove}, all to draw: ${allowedToDraw}`
    // );
    wheels.forEach((wheel) => {
      if (
        wheel.id.slice(-1) == element.id.slice(-1) &&
        !wheel.classList.contains("hidden")
      ) {
        wheel.classList.add("hidden");
      }
    });
  }
}

// Pobieramy elementy (zakładamy, że mają klasy 'element')

// Dodajemy obsługę kliknięcia dla każdego elementu
elements.forEach((element) => {
  element.addEventListener("click", () => {
    toggleBackgroundColor(element);
  });
});

function ChangeBg(id) {}

function updateCursor(size) {
  let cursorCanvas = document.createElement("canvas");
  cursorCanvas.width = size * 1.4;
  cursorCanvas.height = size * 1.4;

  let setSize = cursorCanvas.width;

  let ctx = cursorCanvas.getContext("2d");
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Kolor kursora
  ctx.beginPath();
  ctx.arc(setSize / 2, setSize / 2, setSize / 2, 0, Math.PI * 2);
  ctx.fill();

  document.body.style.cursor = `url(${cursorCanvas.toDataURL()}) ${
    setSize / 1.5
  } ${setSize / 1.5}, auto`;
}

//if a button is clicked, it changes backgroud (it becomes grey) and the other buttons change to white
window.onclick = function (event) {
  var dropdownWrappers = Array.from(document.querySelectorAll('[id^="bt"]'));
  // var menus = Array.from(document.querySelectorAll('[id^="menu"]'));
  //console.log(menu.classList);

  console.log(event.target);

  if (event.target.style) {
    console.log("style");
  }

  for (var i = 0; i < dropdownWrappers.length; i++) {
    var dropdownWrapper = dropdownWrappers[i];
    if (dropdownWrapper.contains(event.target)) {
      // if (dropdownWrapper.getAttribute(style).contains("background: #ffffff")) {
      //   dropdownWrapper.style.removeProperty("background: #ffffff");
      //   dropdownWrapper.style.addProperty("background: #bebaba");
      // } else {
      //   dropdownWrapper.style.removeProperty("background: #bebaba");
      //   dropdownWrapper.style.addProperty("background: #ffff");
      // }
      console.log(dropdownWrapper.getAttribute("style"));

      break;
    }
  }
};

// Wybór elementów: przycisku i ekranu
const button = document.getElementById("bt4");
const screen = document.getElementById("board");

function toggleMenu(menuId) {
  // //let icons = Array.from(document.querySelectorAll('[id^="wheel"]'));
  // var menu = document.getElementById(menuId);
  // if (menu.classList.contains("hidden")) {
  //   //wyświetla kliknięty element
  //   menu.classList.remove("hidden");
  //   //ustawia wszystie inne iframy na ukryte
  //   icons.forEach((icon) => {
  //     // print(`icon id = ${icon.id}`);
  //     // print(`menu id = ${menuId}`);
  //     if (!icon.classList.contains("hidden") && icon.id != menuId) {
  //       menu.classList.add("hidden");
  //     }
  //   });
  // } else {
  //   menu.classList.add("hidden");
  // }
}
function hideMenu(otherId1, otherId2, otherId3, otherId4) {
  const ids = [otherId1, otherId2, otherId3, otherId4];
  ids.forEach((wheel) => {
    if (!wheel.classList.contains("hidden")) {
      wheel.classList.add("hidden");
    }
  });
}
function wbUrl(iframeId, pId) {
  // Pobierz iframe na podstawie jego ID
  // console.log("wbUrl start");
  // const iframe = document.getElementById(iframeId);
  // if (!iframe) {
  //   console.error("Iframe z ID '" + iframeId + "' nie istnieje.");
  //   return;
  // } else {
  //   console.log("taking url");
  //   // // Pobierz dokument w iframe
  //   const iframeDocument = iframe.contentWindow.document;
  //   // // Znajdź paragraf w iframe
  //   const paragraph = iframeDocument.getElementById(pId);
  //   if (paragraph) {
  //     //   // Ustaw tekst paragrafu na URL strony głównej (parent window)
  //     paragraph.textContent = window.location.href;
  //   } else {
  //     console.error("Nie znaleziono paragrafu o podanym ID w iframe: " + pId);
  //   }
  // }
}
