import "@testing-library/jest-dom";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";

import Homepage from "../pages/index";

describe("Homepage", () => {
  it("renders in the dom", () => {
    const { container } = render(<Homepage />);
    expect(container).toBeInTheDocument();
  });
  it('clicks the "Next" button and checks that the "Next" label has increased', () => {
    render(<Homepage />);

    const button = screen.getByText(/Next/i);

    const initialLabel = button.textContent;
    fireEvent.click(button);

    const updatedLabel = button.textContent;
    expect(updatedLabel).not.toBe(initialLabel);
    expect(updatedLabel).toBe(
      `Next ${parseInt(initialLabel.split(" ")[1]) + 1}`
    );
  });
  it('clicks the "Next" button then counter one starts processing client 1', () => {
    render(<Homepage />);

    const button = screen.getByText(/Next/i);

    fireEvent.click(button);

    const counter1Row = screen.getByTestId("counter_1_row");

    const counter1ProcessingRow = counter1Row.children[1];

    expect(counter1ProcessingRow).toHaveTextContent("1");
  });
  it('clicks the "Next" button then counter one after 2 seconds finishes processing client 1 and returns back idle status', async () => {
    jest.useFakeTimers();
    render(<Homepage />);

    const button = screen.getByText(/Next/i);

    fireEvent.click(button);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    const counter1Row = screen.getByTestId("counter_1_row");

    const counter1ProcessingRow = counter1Row.children[1];
    const counter1ProcessedRow = counter1Row.children[2];

    await waitFor(() => {
      expect(counter1ProcessedRow).toHaveTextContent("1");
      expect(counter1ProcessingRow).toHaveTextContent("idle");
    });
    jest.useRealTimers();
  });
  it('clicks the "Next" button 5 times then assign 4 clients to counters in a row and 1 client stays in queue', async () => {
    render(<Homepage />);

    const button = screen.getByText(/Next/i);

    for (let i = 0; i < 5; i++) {
      fireEvent.click(button);
    }

    for (let i = 0; i < 4; i++) {
      const counterRow = screen.getByTestId(`counter_${i + 1}_row`);
      const counterProcessingRow = counterRow.children[1];
      expect(counterProcessingRow).toHaveTextContent(`${i + 1}`);
    }
    const peopleInQueueElement = screen.getByText(
      /Number of people waiting : 1/i
    );
    expect(peopleInQueueElement).toBeInTheDocument();
  });
});
