import React from 'react';
import {cleanup, render} from '@testing-library/react';
import VideoModal from "./VideoModal";

afterEach(cleanup);

it("renders without crashing when closed", () => {
    const {baseElement} = render(<VideoModal  closeModal={() => {}}  isOpen={false}/>);
    expect(baseElement).toBeDefined();
});

it("renders without crashing when open", () => {
  const {baseElement} = render(<VideoModal  closeModal={() => {}}  isOpen={true}/>);
  expect(baseElement).toBeDefined();
  expect(baseElement.querySelector("[id=video-modal]")).toBeDefined()
});

