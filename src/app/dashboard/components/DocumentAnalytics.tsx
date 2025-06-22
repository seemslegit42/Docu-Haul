"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getGeneratedDocumentsForUser } from '@/lib/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, LineChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { format } from 'date-fns';

const chartConfig = {
  NVIS: {
    label: 'NVIS',
    color: 'hsl(var(--chart-1))',
  },
  BillOfSale: {
    label: 'Bill of Sale',
    color: 'hsl(var(--chart-2))',
  },
  'VIN Label': {
    label: 'VIN Label',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;


export function DocumentAnalytics() {
    const { user } = useAuth();
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        async function fetchData() {
            try {
                const docs = await getGeneratedDocumentsForUser(user.uid);

                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                thirtyDaysAgo.setHours(0, 0, 0, 0);

                const docsByDay: { [key: string]: any[] } = {};
                for (const doc of docs) {
                    const docDate = doc.createdAt?.toDate();
                    if (docDate && docDate >= thirtyDaysAgo) {
                        const dateStr = format(docDate, 'yyyy-MM-dd');
                        if (!docsByDay[dateStr]) {
                            docsByDay[dateStr] = [];
                        }
                        docsByDay[dateStr].push(doc);
                    }
                }

                const last30DaysData = [];
                for (let i = 29; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const shortDate = format(date, 'MMM d');
                    
                    const docsForDay = docsByDay[dateStr] || [];
                    
                    last30DaysData.push({
                        date: shortDate,
                        NVIS: docsForDay.filter(d => d.documentType === 'NVIS').length,
                        BillOfSale: docsForDay.filter(d => d.documentType === 'BillOfSale').length,
                        'VIN Label': docsForDay.filter(d => d.documentType === 'VIN Label').length,
                    });
                }
                setChartData(last30DaysData);
            } catch (error) {
                console.error("Error fetching analytics data:", error);
                // Handle error state if needed
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [user]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
        );
    }
    
    const hasData = chartData.some(day => day.NVIS > 0 || day.BillOfSale > 0 || day['VIN Label'] > 0);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <LineChart className="w-6 h-6 text-primary" />
                    <CardTitle>Document Analytics</CardTitle>
                </div>
                <CardDescription>Your document generation activity over the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
                        <RechartsBarChart accessibilityLayer data={chartData} barSize={24} >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value, index) => {
                                    // Show tick for every 3 days to avoid clutter
                                    if (index % 3 === 0) {
                                      return value;
                                    }
                                    return "";
                                  }}
                            />
                            <YAxis allowDecimals={false} />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="NVIS" stackId="a" fill="var(--color-NVIS)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="BillOfSale" stackId="a" fill="var(--color-BillOfSale)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="VIN Label" stackId="a" fill="var(--color-VIN Label)" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                    </ChartContainer>
                ) : (
                    <div className="text-center text-muted-foreground font-body p-10 border border-dashed rounded-md h-[350px] flex flex-col items-center justify-center">
                        <BarChart3 className="w-16 h-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-xl font-headline font-semibold">No Recent Activity</h3>
                        <p>Generate some documents to see your analytics here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
