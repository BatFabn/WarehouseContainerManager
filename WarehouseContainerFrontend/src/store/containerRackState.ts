import { create } from "zustand";

interface SensorData {
  container_id: string;
  rack_id: string;
  fruit: string;
  temperature: number;
  humidity: number;
  methane: number;
  timestamp: string;
  status: string;
  image: string | Record<string, number>;
}

interface ContainerRackState {
  data: Record<string, SensorData>;
  addOrUpdateContainerRackState: (newData: SensorData) => void;
  getContainerRackState: (
    containerId: string,
    rackId: string
  ) => SensorData | null;
}

export const useContainerRackState = create<ContainerRackState>((set, get) => ({
  data: {},

  addOrUpdateContainerRackState: (newData) =>
    set((state) => {
      const key = `${newData.container_id}-${newData.rack_id}`;
      return {
        data: {
          ...state.data,
          [key]: newData,
        },
      };
    }),

  getContainerRackState: (containerId, rackId) => {
    const key = `${containerId}-${rackId}`;
    return get().data[key] || null;
  },
}));
