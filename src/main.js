function getForm(formID) {
  const baseURl = `https://flatland-forms-api-auevpolm5q-uc.a.run.app/forms/${formID}`;
  return fetch(baseURl).then((d) => d.json());
}

function sendForm(formID, body) {
  const baseURL = `https://flatland-forms-api-auevpolm5q-uc.a.run.app/forms/${formID}`;
  return fetch(baseURL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then((d) => d.json());
}

const createInput = (type, label, name, required, helpText) => {
  const field = document.createElement('div');
  field.className = 'form-field';

  if (required) {
    field.className += ' required';
  }

  const input = document.createElement('input');
  input.id = name;
  input.setAttribute('type', type);
  input.setAttribute('name', name);
  input.setAttribute('required', required);

  const labelEl = document.createElement('label');
  labelEl.setAttribute('for', name);
  labelEl.innerText = label;

  field.append(labelEl);
  field.append(input);

  if (helpText) {
    const help = document.createElement('div');
    help.className = 'helpText';
    help.innerText = helpText;
    field.append(help);
  }

  return field;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  btn.setAttribute('disabled', 'true');
  btn.innerText = 'Sending...';

  const { target } = e;

  const body = {
    person: {},
    fields: [],
  };

  for (const field of target) {
    if (field.name) {
      if (!parseInt(field.name, 10)) {
        body.person[field.name] = field.value;
      } else {
        body.fields.push({
          id: field.name,
          value: Number(field.value.replace(/\$/g, '').replace(/,/g, '')),
        });
      }
    }
  }

  try {
    await sendForm(target.id, body);
  } catch (e) {}
  document.getElementById(target.id).remove();
  document.getElementById('form-wrapper').className = 'submitted';
  document.getElementById('form-wrapper').innerHTML = `
    <div class="bless"><span role="img" aria-label="Praying Hands">🙏</span></div>
    <h2>Thank you for being a Mover!</h2>
    <p>We'll keep you posted with regular updates about how the move is going. You can check back here as the money comes in, we'll track how close we're getting to each goal.</p>
    <p>Also, be sure to check your email, we'll send you a confirmation regarding your pledge.</p>
  `;
};

async function buildForm(formID) {
  const { fields } = await getForm(formID);

  const form = document.createElement('form');
  form.id = formID;

  const personGridRow = document.createElement('div');
  personGridRow.className = 'row';
  personGridRow.append(createInput('text', 'First Name', 'firstName', true));
  personGridRow.append(createInput('text', 'Last Name', 'lastName', true));

  form.append(personGridRow);
  form.append(createInput('email', 'Email Address', 'email', true));

  fields.data.forEach(({ attributes, id }) => {
    form.append(
      createInput(
        attributes.field_type === 'custom_field' ? 'tel' : attributes.field_type,
        attributes.label,
        id,
        attributes.required,
        attributes.description,
      ),
    );
  });

  const button = document.createElement('button');
  button.setAttribute('type', 'submit');
  button.innerText = 'Submit Pledge';
  button.id = 'submit-btn';

  form.append(button);

  document.getElementById('form-wrapper').append(form);
  document.getElementById(formID).addEventListener('submit', handleSubmit);
}

export default buildForm;
