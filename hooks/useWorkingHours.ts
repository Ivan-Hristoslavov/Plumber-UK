import { useState, useEffect } from 'react';

export type WorkingHours = {
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
};

export function useWorkingHours() {
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    workingHoursStart: "08:00",
    workingHoursEnd: "18:00",
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"]
  });
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    
    for (let hour = start; hour < end - 1; hour++) {
      const startHour = hour.toString().padStart(2, '0');
      const endHour = (hour + 2).toString().padStart(2, '0');
      slots.push(`${startHour}:00 - ${endHour}:00`);
    }
    
    return slots;
  };

  const fetchWorkingHours = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch working hours');
      }
      
      const responseData = await response.json();
      const data = responseData.settings || [];
      const settings: { [key: string]: any } = {};
      
      data.forEach((setting: any) => {
        try {
          settings[setting.key] = typeof setting.value === 'string' 
            ? JSON.parse(setting.value) 
            : setting.value;
        } catch {
          settings[setting.key] = setting.value;
        }
      });

      const hours: WorkingHours = {
        workingHoursStart: settings.workingHoursStart || "08:00",
        workingHoursEnd: settings.workingHoursEnd || "18:00",
        workingDays: settings.workingDays || ["monday", "tuesday", "wednesday", "thursday", "friday"]
      };

      setWorkingHours(hours);
      
      // Generate time slots
      const slots = generateTimeSlots(hours.workingHoursStart, hours.workingHoursEnd);
      setTimeSlots(slots);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  return {
    workingHours,
    timeSlots,
    isLoading,
    error,
    refetch: fetchWorkingHours
  };
} 