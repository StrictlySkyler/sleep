(function init () {

  'use strict';

  let Lanes;
  let Users;
  let Harbors;
  let Shipments;
  const NAME = 'sleep';

  return module.exports = {

    render_input: function (values) {
      let seconds = values ? values.seconds : '';

      return `
        <p>Sleep for how many seconds?</p>
        <input type=text required name="seconds" value=${seconds}>
        <button class="button hollow">Save</button>
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

      return Harbors.upsert(NAME, {
        lanes: Harbors.findOne(NAME) && Harbors.findOne(NAME).lanes ?
          Harbors.findOne(NAME).lanes :
          {}
      });
    },

    update: function (lane, values) {
      let harbor = Harbors.findOne(lane.type);

      if (values.seconds) values.seconds = parseInt(values.seconds, 10);

      harbor.lanes[lane._id] = {
        manifest: values
      };

      Harbors.update(harbor._id, harbor);

      if (typeof values.seconds == 'number') return true;

      return false;
    },

    work: function (lane, manifest) {
      let exit_code = 1;
      let shipment = Shipments.findOne({
        start: manifest.shipment_start_date,
        lane: lane._id
      });

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

        console.log('Sleeping for', seconds, 'seconds.');

        setTimeout(function () {
          console.log('Done.');
          exit_code = 0;
          done = true;
        }, seconds * 1000);

        //TODO: make this customizable
        let interval_check = $H.setInterval(function () {
          console.log('Polling...');

          if (done == true || ! shipment.active) {
            console.log('Ending shipment.');
            $H.call('Lanes#end_shipment', lane, exit_code, manifest);
            $H.clearInterval(interval_check);
          }
        }, 100);
      }
      catch (err) {
        console.error(err);
        manifest.error = err;
      }

      return manifest;

    }

  };

})();
