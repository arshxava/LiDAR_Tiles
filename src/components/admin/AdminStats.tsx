"use client";

import type { Tile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, CheckCircle2, ListChecks } from 'lucide-react';

interface AdminStatsProps {
  tiles: Tile[];
}

export default function AdminStats({ tiles }: AdminStatsProps) {
  const totalTiles = tiles.length;
  const availableTiles = tiles.filter(t => t.status === 'available').length;
  const assignedTiles = tiles.filter(t => t.status === 'in_progress').length;
  const completedTiles = tiles.filter(t => t.status === 'completed').length;

  const stats = [
    { title: 'Total Tiles', value: totalTiles, icon: ListChecks, color: 'text-blue-500' },
    { title: 'Available', value: availableTiles, icon: Package, color: 'text-green-500' },
    { title: 'In Progress', value: assignedTiles, icon: Clock, color: 'text-orange-500' },
    { title: 'Completed', value: completedTiles, icon: CheckCircle2, color: 'text-purple-500' },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {totalTiles > 0 ? `${((stat.value / totalTiles) * 100).toFixed(1)}% of total` : 'N/A'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
