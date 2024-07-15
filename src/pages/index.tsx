import { ComponentType, FormEvent, useEffect, useRef, useState } from "react";

const COUNTERS = 4;

type Counter = {
  id: number;
  processing: "idle" | number;
  processed: Array<number>;
  processingTime: number;
};

type CounterProcessingTimeInputType = { counterNumber: number };

const CounterRow = (props: Counter) => (
  <tr>
    <td>Counter {props.id}</td>
    <td>{props.processing}</td>
    <td>{props.processed.join(", ")}</td>
  </tr>
);

const CounterProcessingTimeInput = (props: CounterProcessingTimeInputType) => (
  <div className="input">
    <p>Counter {props.counterNumber} Processing Time</p>
    <input
      min="2"
      max="5"
      type="number"
      name={`counter_${props.counterNumber}`}
      defaultValue={2}
    />
  </div>
);

const withList = (Component: ComponentType<CounterProcessingTimeInputType>) => {
  return ({ counters }: { counters: Array<Counter> }) => (
    <div className="counters_initial_state_container">
      {counters.map((c) => (
        <Component key={c.id} counterNumber={c.id} />
      ))}
    </div>
  );
};

const withTable = (Component: ComponentType<Counter>) => {
  return ({ counters }: { counters: Array<Counter> }) => (
    <table>
      <tbody>
        <tr>
          <th>Counter</th>
          <th>Processing</th>
          <th>Processed</th>
        </tr>
        {counters.map((c) => (
          <Component key={c.id} {...c} />
        ))}
      </tbody>
    </table>
  );
};

const CountersList = withList(CounterProcessingTimeInput);

const CountersTable = withTable(CounterRow);

export default function Home() {
  const [counters, setCounters] = useState<Array<Counter>>(
    Array.from({ length: COUNTERS }, (_, idx) => ({
      id: idx + 1,
      processed: [],
      processing: "idle",
      processingTime: 2,
    }))
  );

  const [next, setNext] = useState<number>(1);
  const [clientsInQueue, setClientsInQueue] = useState<number>(0);
  const idles = counters.filter((c) => c.processing === "idle").length;
  const [idleTrigger, setIdleTrigger] = useState(idles);
  const processingTimers = useRef<Array<NodeJS.Timeout>>([]);

  const startProcessing = (
    counterIndex: number,
    currentNumberProcessing: number
  ) => {
    const availableCounterProcessingTime =
      counters[counterIndex].processingTime;
    const timeout = setTimeout(() => {
      setCounters((state) => {
        const newState = [...state];
        const counter = newState[counterIndex];
        counter.processing = "idle";
        counter.processed.push(currentNumberProcessing);
        counter.processed = [...new Set([...counter.processed])];
        return newState;
      });
      setIdleTrigger((state) => state + 1);
    }, availableCounterProcessingTime * 1000);

    processingTimers.current = [...processingTimers.current, timeout];
  };

  useEffect(() => {
    const availableCounter = counters.findIndex((c) => c.processing === "idle");
    const counterAvailableExists = availableCounter > -1;

    if (clientsInQueue <= 0 || !counterAvailableExists) {
      return;
    }

    setCounters((state) => {
      const newState = [...state];
      newState[availableCounter].processing = next;
      return newState;
    });

    setClientsInQueue((state) => state - 1);
    setNext((state) => state + 1);
    startProcessing(availableCounter, next);
  }, [next, clientsInQueue, idleTrigger]);

  const onChangeInit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    processingTimers.current.forEach((t) => clearTimeout(t));
    processingTimers.current = [];

    const target = e.target;
    const countersProcessingTime = Array.from(
      { length: COUNTERS },
      (_, index) => +target[`counter_${index + 1}`].value
    );

    setCounters((state) =>
      state.map((c, i) => ({
        id: c.id,
        processed: [],
        processing: "idle",
        processingTime: countersProcessingTime[i],
      }))
    );

    const clientsInQ = +target["start-number"].value;
    setClientsInQueue(clientsInQ);

    setNext(1);
  };

  return (
    <main className="main">
      <h1>Bank Counter</h1>

      <CountersTable counters={counters} />

      <h4>Number of people waiting : {clientsInQueue}</h4>
      <button onClick={() => setClientsInQueue((state) => state + 1)}>
        Next {next}
      </button>

      <hr />
      <h2>Set Initial State</h2>
      <form className="initial_state_input_container" onSubmit={onChangeInit}>
        <CountersList counters={counters} />
        <div className="input">
          <p>Start Number</p>
          <input type="number" name="start-number" />
        </div>
        <button type="submit">Change Init</button>
      </form>
    </main>
  );
}
