// selection-form.spec.ts

// Imports the AngularJS library and its TypeScript definitions.
import * as angular from 'angular';

// Imports angular-mocks, which provides testing utilities such as
// angular.mock.module() and angular.mock.inject().
import 'angular-mocks';

// Creates a Jasmine test suite for the radio-button and checkbox functionality.
describe('Radio buttons and checkboxes', () => {

    // Stores AngularJS's $compile service.
    // $compile converts an HTML template into a working AngularJS element.
    let $compile: ng.ICompileService;

    // Stores AngularJS's $rootScope service.
    // $rootScope is used to create a new isolated scope for each test.
    let $rootScope: ng.IRootScopeService;

    // Defines the shape of the scope used in the tests.
    // It extends the normal AngularJS scope with a formData object.
    let scope: ng.IScope & {

        // Represents the values controlled by the radio buttons and checkboxes.
        formData: {

            // Stores the selected radio-button value.
            contactMethod: string;

            // Stores whether the Accept Terms checkbox is checked.
            acceptTerms: boolean;

            // Stores whether the Receive Updates checkbox is checked.
            receiveUpdates: boolean;
        };
    };

    // Stores the compiled HTML form.
    // JQLite is AngularJS's lightweight version of jQuery.
    let element: JQLite;

    // Loads the AngularJS application module before every test.
    // Replace 'app' with the actual name of your AngularJS module.
    beforeEach(angular.mock.module('app'));

    // Runs before every individual test.
    // It injects the AngularJS services needed to create and test the form.
    beforeEach(
        angular.mock.inject(
            (
                // Receives AngularJS's $compile service.
                // The underscores allow AngularJS to inject the service while
                // letting us assign it to the variable named $compile.
                _$compile_: ng.ICompileService,

                // Receives AngularJS's $rootScope service.
                _$rootScope_: ng.IRootScopeService
            ) => {

                // Saves the injected $compile service in the test variable.
                $compile = _$compile_;

                // Saves the injected $rootScope service in the test variable.
                $rootScope = _$rootScope_;

                // Creates a new child scope for this test.
                // This prevents one test's data from affecting another test.
                scope = $rootScope.$new() as typeof scope;

                // Sets the initial values used by the form controls.
                scope.formData = {

                    // Makes Email the initially selected contact method.
                    contactMethod: 'email',

                    // Makes the Accept Terms checkbox initially unchecked.
                    acceptTerms: false,

                    // Makes the Receive Updates checkbox initially unchecked.
                    receiveUpdates: false
                };

                // Defines the HTML form that will be compiled and tested.
                const template = `
                    <!--
                        Creates an AngularJS form named selectionForm.
                        AngularJS makes this form available on the scope.
                    -->
                    <form name="selectionForm">

                        <!-- Label for the Email radio button. -->
                        <label>

                            <!--
                                Creates the Email radio button.

                                type="radio" identifies this as a radio button.

                                name="contactMethod" groups this radio button
                                with the Phone radio button. Only one radio
                                button in the group can be selected.

                                value="email" is assigned to the model when
                                this radio button is selected.

                                ng-model connects the radio button to
                                formData.contactMethod.
                            -->
                            <input
                                type="radio"
                                name="contactMethod"
                                value="email"
                                ng-model="formData.contactMethod">

                            <!-- Text displayed beside the radio button. -->
                            Email
                        </label>

                        <!-- Label for the Phone radio button. -->
                        <label>

                            <!--
                                Creates the Phone radio button.

                                Because it has the same name as the Email
                                radio button, the two inputs belong to the
                                same radio-button group.
                            -->
                            <input
                                type="radio"
                                name="contactMethod"
                                value="phone"
                                ng-model="formData.contactMethod">

                            <!-- Text displayed beside the radio button. -->
                            Phone
                        </label>

                        <!-- Label for the Accept Terms checkbox. -->
                        <label>

                            <!--
                                Creates the Accept Terms checkbox.

                                ng-model connects its checked state to
                                formData.acceptTerms.

                                When checked, the model is true.
                                When unchecked, the model is false.
                            -->
                            <input
                                type="checkbox"
                                name="acceptTerms"
                                ng-model="formData.acceptTerms">

                            <!-- Text displayed beside the checkbox. -->
                            Accept terms
                        </label>

                        <!-- Label for the Receive Updates checkbox. -->
                        <label>

                            <!--
                                Creates the Receive Updates checkbox.

                                This checkbox has its own model, so it can be
                                selected independently of Accept Terms.
                            -->
                            <input
                                type="checkbox"
                                name="receiveUpdates"
                                ng-model="formData.receiveUpdates">

                            <!-- Text displayed beside the checkbox. -->
                            Receive updates
                        </label>
                    </form>
                `;

                // Compiles the HTML template using the test scope.
                // This activates directives such as ng-model.
                element = $compile(template)(scope);

                // Runs an AngularJS digest cycle.
                // This synchronizes the initial model values with the HTML.
                scope.$digest();
            }
        )
    );

    // Runs after every individual test.
    afterEach(() => {

        // Removes the compiled form from memory.
        element.remove();

        // Destroys the child scope and its AngularJS watchers.
        // This helps prevent memory leaks and test interference.
        scope.$destroy();
    });

    /**
     * Finds an input element inside the compiled form.
     *
     * @param name  The input's name attribute.
     * @param value An optional value attribute, mainly used for radio buttons.
     * @returns The matching input as an HTMLInputElement.
     */
    function getInput(
        name: string,
        value?: string
    ): HTMLInputElement {

        // Creates a CSS selector using the input's name.
        // Example: input[name="acceptTerms"]
        let selector = `input[name="${name}"]`;

        // Checks whether a value was supplied.
        if (value) {

            // Adds the value to the selector.
            // Example:
            // input[name="contactMethod"][value="email"]
            selector += `[value="${value}"]`;
        }

        // Searches the compiled form for the matching input.
        const input = element[0].querySelector(selector);

        // Verifies that the result exists and is an HTML input element.
        if (!(input instanceof HTMLInputElement)) {

            // Stops the test with a descriptive error when the input
            // cannot be found.
            throw new Error(`Input not found: ${selector}`);
        }

        // Returns the matching input element.
        return input;
    }

    // Tests whether the radio buttons reflect the initial model value.
    it('should select the initial radio button from the model', () => {

        // Finds the Email radio button.
        const emailRadio = getInput('contactMethod', 'email');

        // Finds the Phone radio button.
        const phoneRadio = getInput('contactMethod', 'phone');

        // Verifies that Email is checked because the model starts as "email".
        expect(emailRadio.checked).toBeTrue();

        // Verifies that Phone is not checked.
        expect(phoneRadio.checked).toBeFalse();

        // Verifies that the model still contains the expected value.
        expect(scope.formData.contactMethod).toBe('email');
    });

    // Tests whether clicking Phone updates the AngularJS model.
    it('should update the model when the phone radio button is clicked', () => {

        // Finds the Email radio button.
        const emailRadio = getInput('contactMethod', 'email');

        // Finds the Phone radio button.
        const phoneRadio = getInput('contactMethod', 'phone');

        // Simulates a real user clicking the Phone radio button.
        phoneRadio.click();

        // Runs AngularJS change detection so ng-model is updated.
        scope.$digest();

        // Verifies that the model was changed to "phone".
        expect(scope.formData.contactMethod).toBe('phone');

        // Verifies that the Phone radio button is now checked.
        expect(phoneRadio.checked).toBeTrue();

        // Verifies that Email was automatically unchecked.
        expect(emailRadio.checked).toBeFalse();
    });

    // Tests whether clicking Accept Terms checks the checkbox
    // and changes the model to true.
    it('should check the Accept Terms checkbox', () => {

        // Finds the Accept Terms checkbox.
        const acceptTermsCheckbox = getInput('acceptTerms');

        // Verifies that the initial model value is false.
        expect(scope.formData.acceptTerms).toBeFalse();

        // Verifies that the checkbox is initially unchecked.
        expect(acceptTermsCheckbox.checked).toBeFalse();

        // Simulates a user clicking the checkbox.
        acceptTermsCheckbox.click();

        // Runs AngularJS change detection.
        scope.$digest();

        // Verifies that ng-model changed the model value to true.
        expect(scope.formData.acceptTerms).toBeTrue();

        // Verifies that the HTML checkbox is now checked.
        expect(acceptTermsCheckbox.checked).toBeTrue();
    });

    // Tests whether a checked checkbox can be unchecked.
    it('should uncheck the Accept Terms checkbox', () => {

        // Finds the Accept Terms checkbox.
        const acceptTermsCheckbox = getInput('acceptTerms');

        // Changes the model directly so the checkbox should become checked.
        scope.formData.acceptTerms = true;

        // Synchronizes the model change with the HTML checkbox.
        scope.$digest();

        // Verifies that the checkbox became checked.
        expect(acceptTermsCheckbox.checked).toBeTrue();

        // Simulates another user click, which should uncheck it.
        acceptTermsCheckbox.click();

        // Runs AngularJS change detection so the model is updated.
        scope.$digest();

        // Verifies that the model changed back to false.
        expect(scope.formData.acceptTerms).toBeFalse();

        // Verifies that the HTML checkbox is now unchecked.
        expect(acceptTermsCheckbox.checked).toBeFalse();
    });

    // Tests that the two checkboxes use separate model values.
    it('should maintain separate values for multiple checkboxes', () => {

        // Finds the Accept Terms checkbox.
        const acceptTermsCheckbox = getInput('acceptTerms');

        // Finds the Receive Updates checkbox.
        const updatesCheckbox = getInput('receiveUpdates');

        // Clicks only the Accept Terms checkbox.
        acceptTermsCheckbox.click();

        // Runs AngularJS change detection.
        scope.$digest();

        // Verifies that Accept Terms is true.
        expect(scope.formData.acceptTerms).toBeTrue();

        // Verifies that Receive Updates remains false.
        expect(scope.formData.receiveUpdates).toBeFalse();

        // Clicks the Receive Updates checkbox.
        updatesCheckbox.click();

        // Runs AngularJS change detection again.
        scope.$digest();

        // Verifies that Accept Terms remains true.
        expect(scope.formData.acceptTerms).toBeTrue();

        // Verifies that Receive Updates is now also true.
        expect(scope.formData.receiveUpdates).toBeTrue();
    });
});