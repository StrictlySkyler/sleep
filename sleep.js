(function init () {

  'use strict';

  let Lanes;
  let Users;
  let Harbors;
  let Shipments;
  const NAME = 'sleep';

  return module.exports = {

    render_input: function (values) {
      values = values || {
        seconds: 1,
        exit_code: 0
      };

      return `
        <p>Sleep for how many seconds?</p>
        <input type=text required name="seconds" value=${values.seconds}>
        <p>Exit with:</p>
        <label>
          <input
            type=radio
            name=exit_code
            value=0
            required
            ${values.exit_code == 0 ? 'checked' : ''}
          >
          &nbsp;Success
        </label>
        <label>
          <input
            type=radio
            name=exit_code
            value=1
            required
            ${values.exit_code == 1 ? 'checked' : ''}
          >
          &nbsp;Error
        </label>
      `;
    },

    render_work_preview: function (manifest) {
      console.log(manifest);
      return `<p>Sleep for <span class="pre">${manifest.seconds}</span> seconds.</p>`;
    },

    register: function (lanes, users, harbors, shipments) { 
      Lanes = lanes;
      Users = users;
      Harbors = harbors;
      Shipments = shipments;

      return NAME;
    },

    update: function (lane, values) {
      console.log(values)
      if (values.seconds) values.seconds = parseInt(values.seconds, 10);
      values.seconds = values.seconds || false;
      if (typeof values.seconds == 'number') return true;

      return false;
    },

    work: function (lane, manifest) {
      let exit_code = parseInt(manifest.exit_code, 10);
      let shipment = Shipments.findOne({ _id: manifest.shipment_id });

      if (typeof manifest.seconds != 'number') {
        throw new TypeError(
          'Invalid number of seconds to sleep!\n',
          'The manifest must contain a "seconds" member, which must be an',
          'integer representing the number of seconds to sleep.'
        );
      }

      try {
        let seconds = manifest.random ?
          get_random_seconds(manifest.seconds) :
          manifest.seconds
        ;
        let done = false;

        $H.setTimeout(function () {
          $H.call('Lanes#end_shipment', lane, exit_code, manifest);
        }, seconds * 1000);

      }
      catch (err) {
        console.error(err);
        manifest.error = err;
      }

      return manifest;

    }

  };

})();
