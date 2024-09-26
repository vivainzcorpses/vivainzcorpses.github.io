const firebaseConfig = {
  apiKey: "AIzaSyBkDcw0LDnnajCzUwCe700dN_-SSxJSJKQ",
  authDomain: "vivianzcorpses.firebaseapp.com",
  databaseURL: "https://vivianzcorpses-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "vivianzcorpses",
  storageBucket: "vivianzcorpses.appspot.com",
  messagingSenderId: "890043301",
  appId: "1:890043301:web:e7353bbc1378a95876864c",
  measurementId: "G-XST8FJCCZF"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

function get_viewers_ip(json) {
  let ip = json.ip;

  if (json.security.vpn || json.security.proxy) {
    document.getElementById("check-p").innerHTML =
      "vpn/proxy detected.<br>click to enter.";
    document.getElementById("entry-overlay").style.display = "flex";
    window.addEventListener("click", enterSite);
  } else {
    countViews(ip);
    enterSite();
  }
}

function enterSite() {
  const mainContent = document.querySelector("main");

  document.getElementById("entry-overlay").style.display = "none";
  document.getElementById("entry-overlay").style.visibility = "hidden";
  document.getElementById("entry-overlay").style.opacity = 0;

  mainContent.style.display = "flex";
  mainContent.classList.add("fade-in");

  window.removeEventListener("click", enterSite);

  fetch("https://api.ipify.org/?format=json")
    .then((response) => response.json())
    .then((data) => {
      const ip = data.ip;
      countViews(ip);
    })
    .catch((error) => {
      console.error("Error fetching IP:", error);
    });
}

function countViews(ip) {
  var views;
  var ip_to_string = ip.toString().replace(/\./g, "-");

  firebase
    .database()
    .ref()
    .child("page_views/" + ip_to_string)
    .set({
      viewers_ip: ip,
    });

  firebase
    .database()
    .ref()
    .child("page_views")
    .on("value", function (snapshot) {
      views = snapshot.numChildren();
      animateCountUp(views);
    });
}

fetch("https://api.ipify.org/?format=json")
  .then((response) => response.json())
  .then((data) => {
    fetch(
      `https://vpnapi.io/api/${data.ip}?key=0840c7c180ee4f9a81d591f222762774`
    )
      .then((response) => response.json())
      .then((securityData) => {
        get_viewers_ip(securityData);
      });
  })
  .catch((error) => {
    console.error("Error fetching IP:", error);
  });

function animateCountUp(targetNumber) {
  const pageViewsElement = document.getElementById("page_views");
  const currentNumber = parseInt(pageViewsElement.innerHTML);
  const increment = Math.ceil((targetNumber - currentNumber) / 100); // Increment step
  const duration = 1000; // Duration of the animation in milliseconds
  const steps = Math.ceil(duration / 50); // Number of steps for the animation
  let count = currentNumber;

  const interval = setInterval(() => {
    count += increment;
    if (increment > 0 && count >= targetNumber) {
      count = targetNumber; // Stop at target number
      clearInterval(interval);
    } else if (increment < 0 && count <= targetNumber) {
      count = targetNumber; // Stop at target number
      clearInterval(interval);
    }
    pageViewsElement.innerHTML = count;
  }, 40);
}
