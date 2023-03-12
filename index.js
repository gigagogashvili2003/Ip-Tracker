class IpTracker {
  map = L.map("map");
  baseUrl =
    "https://geo.ipify.org/api/v2/country,city?apiKey=at_491eOIf6dgcG34koi99AlMA7BglBb";
  ipInput = document.getElementById("ip_input");
  searchBtn = document.getElementById("search_button");
  infoBox = document.querySelector(".info_box");
  marker;
  error = null;

  constructor() {
    this.searchBtn.addEventListener(
      "click",
      this.searchClickHandler.bind(this)
    );

    // Initial App Render State
    this.initialRender();
  }

  async initialRender() {
    try {
      const data = await this.sendRequest("");
      const { lat, lng } = data.location;
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);
      this.setMapView(lat, lng);
      this.addMarker(lat, lng);
      this.drawInfoBox(data);
      return Promise.resolve();
    } catch (err) {
      throw new Error(err);
    }
  }

  setMapView(lat, lng) {
    if (!lat || !lng)
      throw new Error(
        `Invalid Latitude And Longitude Values! (${lat}, ${lng})`
      );

    this.map.setView([lat, lng], 13, { animate: true });
  }

  addMarker(lat, lng) {
    if (!lat || !lng)
      throw new Error(
        `Invalid Latitude And Longitude Values! (${lat}, ${lng})`
      );

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    this.marker = L.marker([lat, lng], { animate: true })
      .addTo(this.map)
      .openPopup();
  }

  async searchClickHandler() {
    const ipAddress = this.ipInput.value;
    try {
      this.loading = true;
      const data = await this.sendRequest(ipAddress);
      this.drawInfoBox(data);
      this.setMapView(data?.location?.lat, data?.location?.lng);
      this.addMarker(data?.location?.lat, data?.location?.lng);
      return Promise.resolve();
    } catch (err) {
      document.querySelector(
        ".info_wrapper"
      ).innerHTML = `<section class="info_box"><div class="info_error">${err}</div></section>`;
      Promise.reject(err);
    }
  }

  async drawInfoBox(data) {
    const html = `
    <section class="info_box">
        ${
          data?.ip &&
          `<div class="ip_box">
                <h5>IP ADDRESS</h5>
                <h3>${data.ip}</h3>
           </div>`
        }
        <div class="location_box">
            <h5>LOCATION</h5>
            <h3>${data?.location?.city}, ${data?.location?.country} ${
      data?.location?.postalCode
    }</h3>
        </div>
        <div class="timezone_box">
            <h5>TIMEZONE</h5>
            <h3>${data?.location?.timezone}</h3>
        </div>
        ${
          data?.isp &&
          `<div class="isp_box">
                <h5>ISP</h5>
                <h3>${data.isp}</h3>
            </div>`
        }
    </section>`;

    document.querySelector(".info_wrapper").innerHTML = html;
  }

  async sendRequest(ip) {
    try {
      const res = await fetch(
        `https://geo.ipify.org/api/v2/country,city?apiKey=at_491eOIf6dgcG34koi99AlMA7BglBb&ipAddress=${ip}`
      );

      const data = await res.json();
      return Promise.resolve(data);
    } catch (err) {
      throw new Error(err);
    }
  }
}

const tracker = new IpTracker();
