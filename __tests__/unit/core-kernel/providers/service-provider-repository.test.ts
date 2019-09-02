import "jest-extended";
import { Application } from "@packages/core-kernel/src/application";
import { Container, interfaces } from "@packages/core-kernel/src/container";
import { ServiceProvider, ServiceProviderRepository } from "@packages/core-kernel/src/providers";

class StubServiceProvider extends ServiceProvider {
    public async register(): Promise<void> {}
}

let app: Application;
let container: interfaces.Container;
let serviceProviderRepository: ServiceProviderRepository;

beforeEach(() => {
    container = new Container();
    container.snapshot();

    app = new Application(container);

    serviceProviderRepository = app.resolve<ServiceProviderRepository>(ServiceProviderRepository);
});

afterEach(() => container.restore());

describe("ServiceProviderRepository", () => {
    it(".all", () => {
        const serviceProvider: StubServiceProvider = new StubServiceProvider();
        serviceProviderRepository.set("stub", serviceProvider);

        expect(serviceProviderRepository.all()).toEqual([["stub", serviceProvider]]);
    });

    it(".allLoadedProviders", () => {
        const serviceProvider: StubServiceProvider = new StubServiceProvider();
        serviceProviderRepository.set("stub", serviceProvider);
        serviceProviderRepository.load("stub");

        expect(serviceProviderRepository.allLoadedProviders()).toEqual([serviceProvider]);
    });

    it(".get", () => {
        const serviceProvider: StubServiceProvider = new StubServiceProvider();
        serviceProviderRepository.set("stub", serviceProvider);

        expect(serviceProviderRepository.get("stub")).toEqual(serviceProvider);
    });

    it(".set", () => {
        expect(serviceProviderRepository.has("stub")).toBeFalse();

        serviceProviderRepository.set("stub", new StubServiceProvider());

        expect(serviceProviderRepository.has("stub")).toBeTrue();
    });

    it(".loaded", () => {
        expect(serviceProviderRepository.loaded("stub")).toBeFalse();

        serviceProviderRepository.load("stub");

        expect(serviceProviderRepository.loaded("stub")).toBeTrue();
    });

    it(".failed", () => {
        expect(serviceProviderRepository.failed("stub")).toBeFalse();

        serviceProviderRepository.fail("stub");

        expect(serviceProviderRepository.failed("stub")).toBeTrue();
    });

    it(".deferred", () => {
        expect(serviceProviderRepository.deferred("stub")).toBeFalse();

        serviceProviderRepository.defer("stub");

        expect(serviceProviderRepository.deferred("stub")).toBeTrue();
    });

    it(".register", async () => {
        const serviceProvider: StubServiceProvider = new StubServiceProvider();
        const spyRegister = jest.spyOn(serviceProvider, "register");
        serviceProviderRepository.set("stub", serviceProvider);

        await serviceProviderRepository.register("stub");

        expect(spyRegister).toHaveBeenCalled();
    });

    it(".boot", async () => {
        const serviceProvider: StubServiceProvider = new StubServiceProvider();
        const spyBoot = jest.spyOn(serviceProvider, "boot");
        serviceProviderRepository.set("stub", serviceProvider);

        await serviceProviderRepository.boot("stub");

        expect(spyBoot).toHaveBeenCalled();
        expect(serviceProviderRepository.loaded("stub")).toBeTrue();
        expect(serviceProviderRepository.failed("stub")).toBeFalse();
        expect(serviceProviderRepository.deferred("stub")).toBeFalse();
    });

    it(".dispose", async () => {
        const serviceProvider: StubServiceProvider = new StubServiceProvider();
        const spyDispose = jest.spyOn(serviceProvider, "dispose");
        serviceProviderRepository.set("stub", serviceProvider);

        await serviceProviderRepository.dispose("stub");

        expect(spyDispose).toHaveBeenCalled();
        expect(serviceProviderRepository.loaded("stub")).toBeFalse();
        expect(serviceProviderRepository.failed("stub")).toBeFalse();
        expect(serviceProviderRepository.deferred("stub")).toBeTrue();
    });
});