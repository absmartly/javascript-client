import Client from "../client";
import fetch from "isomorphic-unfetch"; //eslint-disable-line no-shadow

jest.mock("isomorphic-unfetch");

describe("Client", () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	function advanceFakeTimers() {
		let promise = Promise.resolve();
		for (let i = 0; i < 20; i++) {
			promise = promise.then(() => jest.advanceTimersByTime(1000));
		}
	}

	const endpoint = "test.absmartly.com:8080/v1";
	const apiKey = "5ebf06d8cb5d8137290c4abb64155584fbdb64d8";
	const agent = "javascript-client";
	const environment = "test";
	const application = {
		name: "test_app",
		version: 1_000_000,
	};

	const units = {
		session_id: "dca367dcda209b5197f5f83aee862c7bfb09dc68",
	};

	const clientOptions = {
		endpoint,
		agent,
		environment,
		apiKey,
		application,
		timeout: 500,
		retries: 3,
	};

	const defaultMockResponse = {
		guid: "215a4562d1d82ed5658cfa674e8502a317305a25",
		agent,
		environment,
		units,
		application,
	};

	const goals = [
		{
			name: "goal1",
			value: [123],
			achievedAt: 123456789,
		},
	];

	const exposures = [
		{
			name: "exp_test",
			variant: 1,
			exposedAt: 123456789,
			assigned: true,
		},
	];

	const attributes = [
		{
			name: "exp_test",
			value: "1",
			setAt: 123456789,
		},
	];

	function responseMock(statusCode, statusText, response) {
		return {
			ok: statusCode >= 200 && statusCode <= 299,
			status: statusCode,
			statusText,
			text: () => Promise.resolve(response),
			json: () => Promise.resolve(JSON.parse(JSON.stringify(response))),
		};
	}

	it("constructor() should validate options", (done) => {
		const deleteOption = (options, key) => {
			const result = Object.assign({}, options);
			delete result[key];

			return result;
		};

		const emptyOption = (options, key) => {
			const result = Object.assign({}, options);
			result[key] = "";

			return result;
		};

		for (const key of ["apiKey", "endpoint", "environment"]) {
			expect(() => new Client(deleteOption(clientOptions, key))).toThrow();
			expect(() => new Client(emptyOption(clientOptions, key))).toThrow();
		}

		done();
	});

	it("createContext() calls endpoint", (done) => {
		fetch.mockResolvedValue(responseMock(200, "OK", defaultMockResponse));

		const client = new Client(clientOptions);

		client
			.createContext({
				units,
			})
			.then((response) => {
				expect(fetch).toHaveBeenCalledTimes(1);
				expect(fetch).toHaveBeenCalledWith(`${endpoint}/context`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-API-Key": apiKey,
					},
					body: JSON.stringify({
						agent,
						environment,
						application,
						units,
					}),
				});

				expect(response).toStrictEqual(defaultMockResponse);

				done();
			});
	});

	it("refreshContext() calls endpoint", (done) => {
		fetch.mockResolvedValue(responseMock(200, "OK", defaultMockResponse));

		const client = new Client(clientOptions);

		client
			.refreshContext({
				guid: defaultMockResponse.guid,
				units,
			})
			.then((response) => {
				expect(fetch).toHaveBeenCalledTimes(1);
				expect(fetch).toHaveBeenCalledWith(`${endpoint}/context`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-API-Key": apiKey,
					},
					body: JSON.stringify({
						guid: defaultMockResponse.guid,
						agent,
						environment,
						application,
						units,
					}),
				});

				expect(response).toStrictEqual(defaultMockResponse);

				done();
			});
	});

	it("request() retries on connection error", (done) => {
		fetch
			.mockRejectedValueOnce(new Error("error 1"))
			.mockRejectedValueOnce(new Error("error 2"))
			.mockResolvedValueOnce(responseMock(200, "OK", defaultMockResponse));

		const client = new Client(clientOptions);

		client.request("PUT", "/context", {a: 1}, {}).then((response) => {
			expect(fetch).toHaveBeenCalledTimes(3);
			expect(fetch).toHaveBeenLastCalledWith(`${endpoint}/context?a=1`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": apiKey,
				},
				body: JSON.stringify({}),
			});

			expect(response).toEqual(defaultMockResponse);

			done();
		});

		advanceFakeTimers();
	});

	it("request() stops retrying after options.retries", (done) => {
		fetch
			.mockRejectedValueOnce(new Error("error 1"))
			.mockRejectedValueOnce(new Error("error 2"))
			.mockRejectedValueOnce(new Error("error 3"))
			.mockRejectedValueOnce(new Error("error 4"))
			.mockRejectedValueOnce(new Error("error 5"))
			.mockRejectedValueOnce(new Error("error 6"))
			.mockRejectedValueOnce(new Error("error 7"));

		jest.spyOn(Math, "random");
		Math.random.mockReturnValue(0.0);

		const options = Object.assign({}, clientOptions, { retries: 5, timeout: 2000 });
		const client = new Client(options);

		client.request("PUT", "/context", {a: 1},{}).catch((error) => {
			expect(fetch).toHaveBeenCalledTimes(6);
			expect(fetch).toHaveBeenLastCalledWith(`${endpoint}/context?a=1`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": apiKey,
				},
				body: JSON.stringify({}),
			});

			expect(error.message).toEqual("error 6");
			expect(setTimeout).toHaveBeenCalledTimes(5);
			expect(setTimeout.mock.calls.map((x) => x[1]).reduce((x, y) => x + y)).toBeLessThan(2000);

			fetch.mockReset();

			done();
		});

		advanceFakeTimers();
	});

	it("request() stops retrying after options.timeout", (done) => {
		fetch
			.mockRejectedValueOnce(new Error("error 1"))
			.mockRejectedValueOnce(new Error("error 2"))
			.mockRejectedValueOnce(new Error("error 3"))
			.mockRejectedValueOnce(new Error("error 4"))
			.mockRejectedValueOnce(new Error("error 5"))
			.mockRejectedValueOnce(new Error("error 6"))
			.mockRejectedValueOnce(new Error("error 7"));

		jest.spyOn(Math, "random");
		Math.random.mockReturnValue(1.0);

		const options = Object.assign({}, clientOptions, { retries: 5, timeout: 2000 });
		const client = new Client(options);

		client.request("PUT", "/context", {a: 1}, {}).catch((error) => {
			expect(fetch).toHaveBeenCalledTimes(6);
			expect(fetch).toHaveBeenLastCalledWith(`${endpoint}/context?a=1`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": apiKey,
				},
				body: JSON.stringify({}),
			});

			expect(error.message).toEqual("error 6");
			expect(setTimeout).toHaveBeenCalledTimes(5);
			expect(setTimeout.mock.calls.map((x) => x[1]).reduce((x, y) => x + y)).toBeCloseTo(2000, 3);

			fetch.mockReset();

			done();
		});

		advanceFakeTimers();
	});

	it("request() stops retrying on bad request", (done) => {
		fetch.mockResolvedValueOnce(responseMock(400, "bad request", "bad request error text"));

		const client = new Client(clientOptions);

		client.request("POST", "/context", {a: 1}, {}).catch((error) => {
			expect(fetch).toHaveBeenCalledTimes(1);
			expect(fetch).toHaveBeenLastCalledWith(`${endpoint}/context?a=1`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": apiKey,
				},
				body: JSON.stringify({}),
			});

			expect(error.message).toEqual("bad request error text");

			fetch.mockReset();

			done();
		});
	});

	it("request() retries on server errors", (done) => {
		fetch
			.mockResolvedValueOnce(responseMock(500, "server error", "server error text"))
			.mockResolvedValueOnce(responseMock(200, "OK", defaultMockResponse));

		const client = new Client(clientOptions);

		client.request("POST", "/context", {a: 1}, {}).then((response) => {
			expect(fetch).toHaveBeenCalledTimes(2);
			expect(fetch).toHaveBeenLastCalledWith(`${endpoint}/context?a=1`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": apiKey,
				},
				body: JSON.stringify({}),
			});

			expect(response).toEqual(defaultMockResponse);

			fetch.mockReset();

			done();
		});

		advanceFakeTimers();
	});

	it("request() should encode url query parameters", (done) => {
		fetch.mockResolvedValueOnce(responseMock(200, "OK", defaultMockResponse));

		const client = new Client(clientOptions);

		client.request("PUT", "/context", {a: 1, b: "ã=á"}, {}).then((response) => {
			expect(fetch).toHaveBeenCalledTimes(1);
			expect(fetch).toHaveBeenLastCalledWith(`${endpoint}/context?a=1&b=%C3%A3%3D%C3%A1`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": apiKey,
				},
				body: JSON.stringify({}),
			});

			expect(response).toEqual(defaultMockResponse);

			done();
		});
	});

	it("request() should omit query parameters if dict empty", (done) => {
		fetch.mockResolvedValueOnce(responseMock(200, "OK", defaultMockResponse));

		const client = new Client(clientOptions);

		client.request("PUT", "/context", {}, {}).then((response) => {
			expect(fetch).toHaveBeenCalledTimes(1);
			expect(fetch).toHaveBeenLastCalledWith(`${endpoint}/context`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": apiKey,
				},
				body: JSON.stringify({}),
			});

			expect(response).toEqual(defaultMockResponse);

			done();
		});
	});

	it("request() should call fetch with an empty body if not specified", (done) => {
		fetch.mockResolvedValueOnce(responseMock(200, "OK", defaultMockResponse));

		const client = new Client(clientOptions);

		client.request("PUT", "/context").then((response) => {
			expect(fetch).toHaveBeenCalledTimes(1);
			expect(fetch).toHaveBeenLastCalledWith(`${endpoint}/context`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": apiKey,
				},
				body: "",
			});

			expect(response).toEqual(defaultMockResponse);

			done();
		});
	});

	it("publish() calls endpoint", (done) => {
		fetch.mockResolvedValueOnce(responseMock(200, "OK", defaultMockResponse));

		const client = new Client(clientOptions);

		client
			.publish({
				guid: defaultMockResponse.guid,
				units,
				goals,
				exposures,
				attributes,
			})
			.then((response) => {
				expect(fetch).toHaveBeenCalledTimes(1);
				expect(fetch).toHaveBeenCalledWith(`${endpoint}/context`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						"X-API-Key": apiKey,
					},
					body: JSON.stringify({
						agent,
						environment,
						guid: defaultMockResponse.guid,
						application,
						units,
						goals,
						exposures,
						attributes,
					}),
				});

				expect(response).toEqual(defaultMockResponse);

				done();
			});
	});

	it("publish() should omit empty arrays", (done) => {
		fetch.mockResolvedValueOnce(responseMock(200, "OK", defaultMockResponse));

		const client = new Client(clientOptions);

		client
			.publish({
				guid: defaultMockResponse.guid,
				units,
				goals: [],
				exposures: [],
			})
			.then((response) => {
				expect(fetch).toHaveBeenCalledTimes(1);
				expect(fetch).toHaveBeenCalledWith(`${endpoint}/context`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						"X-API-Key": apiKey,
					},
					body: JSON.stringify({
						agent,
						environment,
						guid: defaultMockResponse.guid,
						application,
						units,
					}),
				});

				expect(response).toEqual(defaultMockResponse);

				done();
			});
	});
});
