import React from 'react';
import {cleanup, render} from '@testing-library/react';
import VideoModal from "./LoadingModal";
import LoadingModal from "./LoadingModal";
afterEach(cleanup);
jest.mock('../../index', () => ({
    get apiService() {
        return true // set some default value
    }
}))
it("renders without crashing when closed", () => {
    const {baseElement} = render(<LoadingModal
        onHide={() => {}}
        setVideoData={() => {}}
        showModal={false}
        uid={"-1"}
    />);
    expect(baseElement).toBeDefined();
});

it("renders without crashing when open", () => {
    const {baseElement} = render(<LoadingModal
        onHide={() => {}}
        setVideoData={() => {}}
        showModal={false}
        uid={"-1"}
    />);
  expect(baseElement).toBeDefined();
  expect(baseElement.querySelector("[id=loading-modal]")).toBeDefined()
});

