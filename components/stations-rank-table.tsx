"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/translations";
import { StationStats } from "@/lib/api";
import { formatHours } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface StationsRankTableProps {
  stations: StationStats[];
}

export function StationsRankTable({ stations }: StationsRankTableProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;
  
  const sortedStations = [...stations].sort((a, b) => 
    sortOrder === 'asc' ? a.rank - b.rank : b.rank - a.rank
  );
  
  const totalPages = Math.ceil(sortedStations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStations = sortedStations.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Card className="w-full bg-default">
      <CardHeader>
        <CardTitle className="text-xl">{t.stationsRanking}</CardTitle>
        <CardDescription>{t.stationsRankingDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center gap-1 -ml-4 cursor-pointer bg-transparent hover:bg-transparent"
                >
                  {t.rank}
                  <ArrowUpDown className="size-3" />
                </Button>
              </TableHead>
              <TableHead>{t.stationName}</TableHead>
              <TableHead className="text-right">{t.monthlyIncidentTime}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStations.map((station) => (
              <TableRow 
                key={station.id} 
                className="hover:bg-white/5 cursor-pointer"
                onClick={() => router.push(`/stations?id=${station.id}`)}
              >
                <TableCell>{station.rank}</TableCell>
                <TableCell>{station.name}</TableCell>
                <TableCell className="text-right">
                  {formatHours(station.avgMonthlyIncidentTimeHours)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, stations.length)} of {stations.length}
          </div>
          <div className="text-sm text-muted-foreground text-center flex-1 mx-4">
            {t.clickStationToView}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="cursor-pointer bg-transparent hover:bg-transparent"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="cursor-pointer bg-transparent hover:bg-transparent"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
