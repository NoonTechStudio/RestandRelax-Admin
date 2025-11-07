import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  MapPin,
  Users,
  Bed,
  UtensilsCrossed,
  Trash2,
  Pencil,
  Plus,
  Droplet,
} from "lucide-react";

export default function GetLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
   const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/locations`);
      if (!res.ok) throw new Error("Failed to fetch locations");
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirmation = (locationId, locationName) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Delete Location
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to delete "{locationName}"? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => {
              handleDelete(locationId);
              toast.dismiss(t.id);
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Yes
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              toast.error("Deletion cancelled");
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            No
          </button>
        </div>
      </div>
    ));
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/locations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Location deleted successfully!");
      setLocations((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteClick = (locationId, locationName) => {
    showDeleteConfirmation(locationId, locationName);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-600 text-lg font-medium animate-pulse">
          Loading resort locations...
        </p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-inter">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="w-7 h-7 text-[#008DDA]" />
          Resort Locations
        </h1>
        <button
          onClick={() => navigate("/locations/new")}
          className="mt-4 sm:mt-0 flex items-center gap-2 bg-[#008DDA] text-white px-4 py-2 rounded-lg shadow hover:bg-[#0074b8] transition"
        >
          <Plus size={18} /> New Location
        </button>
      </div>

      {locations.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">
          No resort locations found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {locations.map((loc) => (
            <div
              key={loc._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all p-6 flex flex-col"
            >
              {/* Title & Address */}
              <div className="mb-3">
                <h2 className="text-xl font-semibold text-gray-800">
                  {loc.name}
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4 text-[#008DDA]" />
                  {loc.address?.line1}, {loc.address?.city}, {loc.address?.state}
                </p>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {loc.description || "No description available."}
              </p>

              {/* Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100 text-sm text-gray-700 space-y-2">
                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#008DDA]" />
                  <span>
                    <span className="font-medium">
                      {loc.capacityOfPersons || "-"}
                    </span>{" "}
                    persons capacity
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-[#008DDA]" />
                  {loc.propertyDetails?.bedrooms ?? 0} Bedrooms |{" "}
                  {loc.propertyDetails?.kitchens ?? 0} Kitchens
                </p>
                <p className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-[#008DDA]" />
                  Swimming Pools:{" "}
                  <span className="font-medium">
                    {loc.propertyDetails?.swimmingPools ?? 0}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-[#008DDA]" />
                  With Food:{" "}
                  <span
                    className={`font-semibold ${
                      loc.propertyDetails?.withFood
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {loc.propertyDetails?.withFood ? "Yes" : "No"}
                  </span>
                </p>
              </div>

              {/* Amenities */}
              {loc.amenities?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {loc.amenities.slice(0, 6).map((a, i) => (
                      <span
                        key={i}
                        className="bg-blue-50 text-[#008DDA] text-xs font-medium px-2 py-1 rounded-md border border-blue-100"
                      >
                        {a}
                      </span>
                    ))}
                    {loc.amenities.length > 6 && (
                      <span className="text-xs text-gray-500">
                        +{loc.amenities.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="bg-gray-100 border rounded-lg p-4 text-sm text-gray-800 mb-4">
                <p>
                  💰{" "}
                  <span className="font-semibold text-[#008DDA]">
                    ₹{loc.pricing?.pricePerAdult}
                  </span>{" "}
                  / Adult
                </p>
                <p>
                  👶 ₹{loc.pricing?.pricePerKid} / Kid
                </p>
                <p>➕ Extra: ₹{loc.pricing?.extraPersonCharge || 0}</p>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center mt-auto pt-3 border-t">
                <button
                  onClick={() => navigate(`/locations/edit/${loc._id}`)}
                  className="w-1/2 mr-2 flex justify-center items-center gap-2 py-2 text-sm bg-[#008DDA] text-white rounded-md hover:bg-[#0074b8] transition"
                >
                  <Pencil size={16} /> Update
                </button>
                <button
                  onClick={() => handleDeleteClick(loc._id, loc.name)}
                  className="w-1/2 flex justify-center items-center gap-2 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}