// This is a temporary solution:
// In MSFS the BaseInstrument class exists, so we can use that as the parent (required by the SDK),
// but in the browser, it doesn't exist, so we are using an empty parent class.
// Obviously this useless indirection should be removed from the shipped solution,
// it is only for easier browser testing.
let isMsfs = (typeof (BaseInstrument) === "function");

let GlassCockpitParent = isMsfs ? BaseInstrument : class {

    // empty functions just for the super() calls 
    constructor() { }
    Init() { }
    connectedCallback() { }
    Update() { }
};

class PfTestInstrument extends GlassCockpitParent {
    constructor() {
        super();

        // Not safe to call getElementById here in MSFS, only in connectedCallback()
    }

    get templateID() {
        return "PF-TEST-INSTRUMENT";
    }

    get isInteractive() {
        return true;
    }

    onInteractionEvent(args) {
        console.log("click");
    }

    Init() {
        super.Init();
    }

    connectedCallback() {
        super.connectedCallback();
        this.elemPanel = document.getElementById("panel-container");

        // Get references to the pages and sliders
        this.attitudePage = document.getElementById("attitudePage");
        this.statusPage = document.getElementById("statusPage");
        this.upDownSlider = document.getElementById("upDownSlider");
        this.turningSlider = document.getElementById("turningSlider");

        this.horizonLine = document.getElementById("horizonLine");
        this.bankArc = document.getElementById("bankArc");
        this.bankArcTriangle = document.getElementById("bankArcTriangle");
        this.pitchGroup = document.getElementById("pitchGroup");
        this.bankGroup = document.getElementById("bankGroup");

        const btnAttitude = document.getElementById("btnAttitude");
        const btnStatus = document.getElementById("btnStatus");

        // Default page is attitude
        this._showAttitudePage();

        // Add event listeners to buttons
        btnAttitude.addEventListener('click', () => this._showAttitudePage());
        btnStatus.addEventListener('click', () => this._showStatusPage());

        // Add event listeners to sliders
        this.upDownSlider.addEventListener('input', () => this._updateAttitude());
        this.turningSlider.addEventListener('input', () => this._updateAttitude());
    }

    _showAttitudePage() {
        this.attitudePage.style.display = "block";
        this.statusPage.style.display = "none";
    }

    _showStatusPage() {
        this.attitudePage.style.display = "none";
        this.statusPage.style.display = "block";
    }

    _updateAttitude() {
        const pitch = this.upDownSlider.value;
        const bank = this.turningSlider.value;

        // Move pitch group up and down based on pitch slider
        this.pitchGroup.setAttribute('transform', `translate(0, ${-pitch * 1.5}) rotate(${-bank})`);

        // Rotate bank group based on turning slider
        this.bankGroup.setAttribute('transform', `rotate(${-bank})`);
    }
    Update() {
        super.Update();
        let electricity;

        if (isMsfs) {
            // TODO CHANGE CIRCUIT VARIABLE TO THE RIGHT ONE FOR THE CURRENT USECASE
            electricity = SimVar.GetSimVarValue(CIRCUIT, "Bool");
            if (!electricity) return this._turnOff();
        }
        else {
            electricity = VarGet(CIRCUIT, "Bool");
            if (electricity == false) return this._turnOff();
        }

        if (electricity && this.elemPanel.getAttribute("state") == "off") {
            this._turnOn();
        }

        // do the updates here 
    }

    _turnOff() {
        this.elemPanel.setAttribute("state", "off");
    }

    _turnOn() {
        this.elemPanel.setAttribute("state", "on");
    }
}

// Javított zárójeles logika a végén:
if (isMsfs) {
    registerInstrument("pf-test-instrument", PfTestInstrument);
} else {
    const glasscockpit = new PfTestInstrument();
    glasscockpit.Init();
    glasscockpit.connectedCallback();

    function loop(timestamp) {
        glasscockpit.Update();
        window.requestAnimationFrame(loop);
    }

    window.requestAnimationFrame(loop);
}
