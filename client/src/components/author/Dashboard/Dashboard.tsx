import React from 'react';
import { Link } from 'react-router-dom';
import { 
  IconBook, 
  IconSparks, 
  IconAnalytics, 
  IconPen, 
  IconUsers,
  IconTrending,
  IconArrowRight 
} from '../../../types/icons';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';

interface DashboardStats {
  stories: number;
  published: number;
  sparksReceived: number;
  subscribers: number;
  totalReads: number;
}

interface DashboardProps {
  stats: DashboardStats;
  recentActivity: any[];
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, recentActivity }) => {
  const statItems = [
    { label: 'Stories', value: stats.stories, icon: IconBook, color: '#235347' },
    { label: 'Published', value: stats.published, icon: IconTrending, color: '#235347' },
    { label: 'Sparks received', value: stats.sparksReceived, icon: IconSparks, color: '#F4A460' },
    { label: 'Subscribers', value: stats.subscribers, icon: IconUsers, color: '#235347' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-primary-900">Author Studio</h1>
          <p className="text-gray-600 text-sm">
            Everything you write lives here as a draft until you publish it.
          </p>
        </div>
        <Link to="/author/new-story">
          <Button icon={IconPen}>
            Start a new story
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statItems.map((stat) => (
          <Card key={stat.label} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <stat.icon size={20} color={stat.color} />
              <span className="text-2xl font-bold text-primary-900">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-serif text-primary-900 mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 text-sm">
                  <Badge size="sm" variant="default">
                    {activity.type}
                  </Badge>
                  <span className="text-gray-600">{activity.description}</span>
                  <span className="text-gray-400 text-xs ml-auto">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-serif text-primary-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/author/new-story">
              <Button variant="outline" fullWidth icon={IconPen}>
                Create New Story
              </Button>
            </Link>
            <Link to="/author/analytics">
              <Button variant="outline" fullWidth icon={IconAnalytics}>
                View Analytics
              </Button>
            </Link>
            <Link to="/author/settings">
              <Button variant="outline" fullWidth>
                Manage Donation Links
                <IconArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};