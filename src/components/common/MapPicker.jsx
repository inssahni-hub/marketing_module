import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "300px",
};

export default function MapPicker({ lat, lng, onChange }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBvSHq_r2fEmyG_g3OCJQ7SwXGUw4mRujA",
  });

  if (!isLoaded) return <div>Loading Map...</div>;

  const center = {
    lat: Number(lat) || 20.5937,
    lng: Number(lng) || 78.9629,
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onClick={(e) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();

        onChange(newLat, newLng);
      }}
    >
      {lat && lng && <Marker position={{ lat: Number(lat), lng: Number(lng) }} />}
    </GoogleMap>
  );
}