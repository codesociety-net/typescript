// Product interface
export interface Transport {
  deliver(cargo: string): string;
}

// Concrete products
export class Truck implements Transport {
  deliver(cargo: string): string {
    return `Delivering "${cargo}" by road in a truck`;
  }
}

export class Ship implements Transport {
  deliver(cargo: string): string {
    return `Delivering "${cargo}" by sea in a ship`;
  }
}

// Creator with the factory method
export abstract class Logistics {
  abstract createTransport(): Transport;

  planDelivery(cargo: string): string {
    const transport = this.createTransport();
    return transport.deliver(cargo);
  }
}

// Concrete creators
export class RoadLogistics extends Logistics {
  createTransport(): Transport {
    return new Truck();
  }
}

export class SeaLogistics extends Logistics {
  createTransport(): Transport {
    return new Ship();
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Usage
  const logistics: Logistics = new RoadLogistics();
  console.log(logistics.planDelivery("Electronics"));
  
  const seaLogistics: Logistics = new SeaLogistics();
  console.log(seaLogistics.planDelivery("Grain"));
}
