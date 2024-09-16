import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import GoogleMapReact from "google-map-react";
import { getFirestore, collection, getDocs } from "firebase/firestore";

function PublicTransitStops() {
  const [stops, setStops] = useState([]);
  const [trips, setTrips] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [map, setMap] = useState(null);
  const [mapsApi, setMapsApi] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore();

        // Fetch stops
        const stopsCollection = await getDocs(collection(db, "stops"));
        const stopsData = stopsCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStops(stopsData);

        // Fetch trips
        const tripsCollection = await getDocs(collection(db, "trips"));
        const tripsData = tripsCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrips(tripsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const renderUpcomingBuses = (stopId) => {
    const upcomingBuses = trips
      .filter((trip) => {
        const stopTime = new Date(trip.stop_times[stopId]);
        return stopTime > currentTime && stopTime - currentTime <= 7200000; // 2 hours in milliseconds
      })
      .sort((a, b) => new Date(a.stop_times[stopId]) - new Date(b.stop_times[stopId]))
      .slice(0, 5);

    if (upcomingBuses.length === 0) {
      return "No upcoming buses";
    }

    return upcomingBuses.map((bus) => (
      `<div key=${bus.id}>
        <p>Bus: ${bus.route_id}</p>
        <p>Arrival Time: ${new Date(bus.stop_times[stopId]).toLocaleTimeString()}</p>
      </div>`
    )).join('');
  };

  const renderMarkers = (map, mapsApi) => {
    stops.forEach((stop) => {
      const infoWindow = new mapsApi.InfoWindow({
        content: `<div><strong>${stop.stop_name}</strong><div id="info-${stop.id}">Loading...</div></div>`,
      });

      const marker = new mapsApi.Marker({
        position: { lat: parseFloat(stop.stop_lat), lng: parseFloat(stop.stop_lon) },
        map,
        title: stop.stop_name,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
        const infoContent = document.getElementById(`info-${stop.id}`);
        if (infoContent) {
          infoContent.innerHTML = renderUpcomingBuses(stop.id);
        }
      });
    });
  };

  useEffect(() => {
    if (mapsApi && map) {
      renderMarkers(map, mapsApi);
    }
  }, [mapsApi, map, stops, trips, currentTime]);

  return (
    <Container>
      <div className="text-center mt-3">
        <h2 className="text-uppercase p-2 page-title">Public Transit Stops</h2>
      </div>
      <Row>
        <Col md={8}>
          <div style={{ height: "80vh", width: "100%" }}>
            <GoogleMapReact
              bootstrapURLKeys={{ key: "AIzaSyCt6m1rrV32jEStp8x-cgBL0WwL9zXKOG4", libraries: ['places'] }}
              defaultCenter={{ lat: 41.9028, lng: 12.4964 }}
              defaultZoom={14}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={({ map, maps }) => {
                console.log("Google Maps API loaded");
                setMap(map);
                setMapsApi(maps);
              }}
              onError={(e) => console.error("Error loading Google Maps API", e)}
            >
              {/* Markers are rendered by the useEffect hook */}
            </GoogleMapReact>
          </div>
        </Col>
        <Col md={4}>
          <h2 className="mt-3">Upcoming Buses Information</h2>
          {/* You can also add a list of upcoming buses for all stops here */}
        </Col>
      </Row>
    </Container>
  );
}

export default PublicTransitStops;
