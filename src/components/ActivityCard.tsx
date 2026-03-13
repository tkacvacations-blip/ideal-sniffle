import { Clock, Users, ShoppingCart } from 'lucide-react';
import { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  onAddToCart: (activity: Activity) => void;
}

export function ActivityCard({ activity, onAddToCart }: ActivityCardProps) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      <div className="relative h-64 overflow-hidden">
        <img
          src={activity.image_url}
          alt={activity.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-white mb-1">{activity.name}</h3>
        </div>
      </div>

      <div className="p-6">
        <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
          {activity.description}
        </p>

        <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
          {activity.duration_hours && activity.duration_hours !== 0 && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600" />
              <span>{activity.duration_hours}h</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-600" />
            <span>Up to {activity.capacity}</span>
          </div>
        </div>

        <button
          onClick={() => onAddToCart(activity)}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
