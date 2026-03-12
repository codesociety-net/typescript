export interface Mediator {
  notify(sender: ChatParticipant, message: string): void;
}

export abstract class ChatParticipant {
  constructor(
    protected readonly name: string,
    protected mediator: Mediator
  ) {}

  send(message: string): void {
    console.log(`[${this.name}] sends: ${message}`);
    this.mediator.notify(this, message);
  }

  receive(from: string, message: string): void {
    console.log(`[${this.name}] received from ${from}: ${message}`);
  }
}

export class User extends ChatParticipant {}

export class ChatRoom implements Mediator {
  private participants: ChatParticipant[] = [];

  join(participant: ChatParticipant): void {
    this.participants.push(participant);
  }

  notify(sender: ChatParticipant, message: string): void {
    for (const participant of this.participants) {
      if (participant !== sender) {
        (participant as User).receive(
          (sender as unknown as { name: string }).name,
          message
        );
      }
    }
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Usage
  const room = new ChatRoom();
  const alice = new User("Alice", room);
  const bob = new User("Bob", room);
  const carol = new User("Carol", room);
  
  room.join(alice);
  room.join(bob);
  room.join(carol);
  
  alice.send("Hello everyone!");
  // Bob received from Alice: Hello everyone!
  // Carol received from Alice: Hello everyone!
}
