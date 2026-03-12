import { describe, it, expect, vi } from "vitest";
import { User, ChatRoom } from "./conceptual";

describe("Mediator (Conceptual)", () => {
  it("message from one user is received by other participants", () => {
    const room = new ChatRoom();
    const alice = new User("Alice", room);
    const bob = new User("Bob", room);

    room.join(alice);
    room.join(bob);

    const bobReceive = vi.spyOn(bob, "receive");

    alice.send("Hello!");

    expect(bobReceive).toHaveBeenCalledWith("Alice", "Hello!");
  });

  it("sender does not receive their own message", () => {
    const room = new ChatRoom();
    const alice = new User("Alice", room);
    const bob = new User("Bob", room);

    room.join(alice);
    room.join(bob);

    const aliceReceive = vi.spyOn(alice, "receive");

    alice.send("Hello!");

    expect(aliceReceive).not.toHaveBeenCalled();
  });

  it("message is broadcast to all other participants", () => {
    const room = new ChatRoom();
    const alice = new User("Alice", room);
    const bob = new User("Bob", room);
    const carol = new User("Carol", room);

    room.join(alice);
    room.join(bob);
    room.join(carol);

    const bobReceive = vi.spyOn(bob, "receive");
    const carolReceive = vi.spyOn(carol, "receive");

    alice.send("Hi all!");

    expect(bobReceive).toHaveBeenCalledWith("Alice", "Hi all!");
    expect(carolReceive).toHaveBeenCalledWith("Alice", "Hi all!");
  });

  it("participant not joined does not receive messages", () => {
    const room = new ChatRoom();
    const alice = new User("Alice", room);
    const bob = new User("Bob", room);

    room.join(alice);
    // bob is NOT joined

    const bobReceive = vi.spyOn(bob, "receive");
    alice.send("Hello?");

    expect(bobReceive).not.toHaveBeenCalled();
  });

  it("multiple messages are each delivered independently", () => {
    const room = new ChatRoom();
    const alice = new User("Alice", room);
    const bob = new User("Bob", room);

    room.join(alice);
    room.join(bob);

    const bobReceive = vi.spyOn(bob, "receive");

    alice.send("First");
    alice.send("Second");

    expect(bobReceive).toHaveBeenCalledTimes(2);
    expect(bobReceive).toHaveBeenNthCalledWith(1, "Alice", "First");
    expect(bobReceive).toHaveBeenNthCalledWith(2, "Alice", "Second");
  });

  it("different senders are identified correctly", () => {
    const room = new ChatRoom();
    const alice = new User("Alice", room);
    const bob = new User("Bob", room);
    const carol = new User("Carol", room);

    room.join(alice);
    room.join(bob);
    room.join(carol);

    const carolReceive = vi.spyOn(carol, "receive");

    alice.send("from alice");
    bob.send("from bob");

    expect(carolReceive).toHaveBeenCalledWith("Alice", "from alice");
    expect(carolReceive).toHaveBeenCalledWith("Bob", "from bob");
  });

  it("sending with no other participants does not throw", () => {
    const room = new ChatRoom();
    const alice = new User("Alice", room);
    room.join(alice);

    expect(() => alice.send("echo")).not.toThrow();
  });
});
