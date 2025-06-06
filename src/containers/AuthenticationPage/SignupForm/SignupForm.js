import React, { useState } from 'react';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import * as validators from '../../../util/validators';
import { getPropsForCustomUserFieldInputs } from '../../../util/userHelpers';

import { Form, PrimaryButton, FieldTextInput, CustomExtendedDataField } from '../../../components';

import FieldSelectUserType from '../FieldSelectUserType';
import UserFieldDisplayName from '../UserFieldDisplayName';
import UserFieldPhoneNumber from '../UserFieldPhoneNumber';
import { ImageUploader, Dropdown } from '../../../components';

import css from './SignupForm.module.css';

const getSoleUserTypeMaybe = userTypes =>
  Array.isArray(userTypes) && userTypes.length === 1 ? userTypes[0].userType : null;

const SignupFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    initialValues={{ userType: props.preselectedUserType || getSoleUserTypeMaybe(props.userTypes) }}
    render={formRenderProps => {
      const {
        rootClassName,
        className,
        formId,
        handleSubmit,
        inProgress,
        invalid,
        intl,
        termsAndConditions,
        preselectedUserType,
        userTypes,
        userFields,
        values,
      } = formRenderProps;

      const { userType } = values || {};

      // email
      const emailRequired = validators.required(
        intl.formatMessage({
          id: 'SignupForm.emailRequired',
        })
      );
      const emailValid = validators.emailFormatValid(
        intl.formatMessage({
          id: 'SignupForm.emailInvalid',
        })
      );

      // password
      const passwordRequiredMessage = intl.formatMessage({
        id: 'SignupForm.passwordRequired',
      });
      const passwordMinLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooShort',
        },
        {
          minLength: validators.PASSWORD_MIN_LENGTH,
        }
      );
      const passwordMaxLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooLong',
        },
        {
          maxLength: validators.PASSWORD_MAX_LENGTH,
        }
      );
      const passwordMinLength = validators.minLength(
        passwordMinLengthMessage,
        validators.PASSWORD_MIN_LENGTH
      );
      const passwordMaxLength = validators.maxLength(
        passwordMaxLengthMessage,
        validators.PASSWORD_MAX_LENGTH
      );
      const passwordRequired = validators.requiredStringNoTrim(passwordRequiredMessage);
      const passwordValidators = validators.composeValidators(
        passwordRequired,
        passwordMinLength,
        passwordMaxLength
      );

      // Custom user fields. Since user types are not supported here,
      // only fields with no user type id limitation are selected.
      const userFieldProps = getPropsForCustomUserFieldInputs(userFields, intl, userType);

      const noUserTypes = !userType && !(userTypes?.length > 0);
      const userTypeConfig = userTypes.find(config => config.userType === userType);
      const showDefaultUserFields = userType || noUserTypes;
      const showCustomUserFields = (userType || noUserTypes) && userFieldProps?.length > 0;

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = invalid || submitInProgress;

      const handleProfileSelect = file => {
        console.log('Selected profile image:', file);
      };

      const [role, setRole] = useState('');

      const roles = [
        { value: 'individual', label: 'I am an individual property owner' },
        { value: 'freelance', label: 'I am a freelance agent' },
        { value: 'company', label: 'I represent a registered company' },
      ];

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <FieldSelectUserType
            name="userType"
            userTypes={userTypes}
            hasExistingUserType={!!preselectedUserType}
            intl={intl}
          />

          {showDefaultUserFields ? (
            <div className={css.defaultUserFields}>
              <FieldTextInput
                type="email"
                id={formId ? `${formId}.email` : 'email'}
                name="email"
                autoComplete="email"
                label={intl.formatMessage({
                  id: 'SignupForm.emailLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'SignupForm.emailPlaceholder',
                })}
                validate={validators.composeValidators(emailRequired, emailValid)}
              />
              <div className={css.name}>
                <FieldTextInput
                  className={css.firstNameRoot}
                  type="text"
                  id={formId ? `${formId}.fname` : 'fname'}
                  name="fname"
                  autoComplete="given-name"
                  label={intl.formatMessage({
                    id: 'SignupForm.firstNameLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'SignupForm.firstNamePlaceholder',
                  })}
                  validate={validators.required(
                    intl.formatMessage({
                      id: 'SignupForm.firstNameRequired',
                    })
                  )}
                />
                <FieldTextInput
                  className={css.lastNameRoot}
                  type="text"
                  id={formId ? `${formId}.lname` : 'lname'}
                  name="lname"
                  autoComplete="family-name"
                  label={intl.formatMessage({
                    id: 'SignupForm.lastNameLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'SignupForm.lastNamePlaceholder',
                  })}
                  validate={validators.required(
                    intl.formatMessage({
                      id: 'SignupForm.lastNameRequired',
                    })
                  )}
                />
              </div>

              <UserFieldDisplayName
                formName="SignupForm"
                className={css.row}
                userTypeConfig={userTypeConfig}
                intl={intl}
              />

              <FieldTextInput
                className={css.password}
                type="password"
                id={formId ? `${formId}.password` : 'password'}
                name="password"
                autoComplete="new-password"
                label={intl.formatMessage({
                  id: 'SignupForm.passwordLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'SignupForm.passwordPlaceholder',
                })}
                validate={passwordValidators}
              />

              <UserFieldPhoneNumber
                formName="SignupForm"
                className={css.row}
                userTypeConfig={userTypeConfig}
                intl={intl}
              />
            </div>
          ) : null}
          {userType == 'provider' ? (
            <div>
              <ImageUploader
                label="ID Document (KTP/Driving License/Passport)"
                columns={1}
                dropzoneHeight="100px"
                labelText=""
                maxImages={1}
                onProfileChange={handleProfileSelect}
              />
              <div style={{ marginTop: '1.5rem' }}>
                <Dropdown label="Role" value={role} onChange={setRole} options={roles} />
              </div>
              {role == 'individual' ? (
                <>
                  <div style={{ marginTop: '2rem' }}>
                    <FieldTextInput
                      type="text"
                      id={'NIK'}
                      name="NIK"
                      label="Personal Number on ID card (NIK)"
                      placeholder={3212345678990001}
                    />
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <FieldTextInput
                      type="text"
                      id={'facebook'}
                      name="Facebook"
                      label="Facebook Profile"
                      placeholder={'Your Facebook Profile'}
                    />
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <FieldTextInput
                      type="text"
                      id={'instagram'}
                      name="Instagram"
                      label="Instagram Profile"
                      placeholder={'Your Instagram Profile'}
                    />
                  </div>
                  <ImageUploader
                    label="Add a selfie of you holding your ID card"
                    columns={1}
                    dropzoneHeight="100px"
                    labelText=""
                    maxImages={1}
                    onProfileChange={handleProfileSelect}
                  />
                </>
              ) : role == 'freelance' ? (
                <>
                  <div style={{ marginTop: '2rem' }}>
                    <FieldTextInput
                      type="text"
                      id={'NIK'}
                      name="NIK"
                      label="Personal NPWP or NIK"
                      placeholder={'Your NPWP or NIK Number'}
                    />
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <FieldTextInput
                      type="text"
                      id={'facebook'}
                      name="Facebook"
                      label="Facebook Profile"
                      placeholder={'Your Facebook Profile'}
                    />
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <FieldTextInput
                      type="text"
                      id={'instagram'}
                      name="Instagram"
                      label="Instagram Profile"
                      placeholder={'Your Instagram Profile'}
                    />
                  </div>
                  <ImageUploader
                    label="Add a selfie of you holding your ID card"
                    columns={1}
                    dropzoneHeight="100px"
                    labelText=""
                    maxImages={1}
                    onProfileChange={handleProfileSelect}
                  />
                </>
              ) : role == 'company' ? (
                <>
                  <div style={{ marginTop: '2rem' }}>
                    <FieldTextInput
                      type="text"
                      id={'company'}
                      name="company"
                      label="Company Name"
                      placeholder={'Your Company Name'}
                    />
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <FieldTextInput
                      type="text"
                      id={'companyAddress'}
                      name="CompanyAddress "
                      label="Company Address"
                      placeholder={'Your Company Address'}
                    />
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <FieldTextInput
                      type="text"
                      id={'NIB'}
                      name="NIB"
                      label="Business registration number (NIB) or tax number (NPWP)"
                      placeholder={'Business Number'}
                    />
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <FieldTextInput
                      type="text"
                      id={'web'}
                      name="web"
                      label="Company Website"
                      placeholder={'Your Company Website'}
                    />
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <FieldTextInput
                      type="text"
                      id={'facebook'}
                      name="facebook"
                      label="Company Facebook Page or Account"
                      placeholder={'Your Company Facebook'}
                    />
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <FieldTextInput
                      type="text"
                      id={'instagram'}
                      name="instagram"
                      label="Instagram Profile"
                      placeholder={'Your Company Instagram'}
                    />
                  </div>
                  <ImageUploader
                    label="Screenshot/Picture NIB or NPWP Mentioning Company Name"
                    columns={1}
                    dropzoneHeight="100px"
                    labelText=""
                    maxImages={1}
                    onProfileChange={handleProfileSelect}
                  />
                </>
              ) : null}
            </div>
          ) : null}

          {showCustomUserFields ? (
            <div className={css.customFields}>
              {userFieldProps.map(({ key, ...fieldProps }) => (
                <CustomExtendedDataField key={key} {...fieldProps} formId={formId} />
              ))}
            </div>
          ) : null}

          <div className={css.bottomWrapper}>
            {termsAndConditions}
            <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
              <FormattedMessage id="SignupForm.signUp" />
            </PrimaryButton>
          </div>
        </Form>
      );
    }}
  />
);

/**
 * A component that renders the signup form.
 *
 * @component
 * @param {Object} props
 * @param {string} props.rootClassName - The root class name that overrides the default class css.root
 * @param {string} props.className - The class that extends the root class
 * @param {string} props.formId - The form id
 * @param {boolean} props.inProgress - Whether the form is in progress
 * @param {ReactNode} props.termsAndConditions - The terms and conditions
 * @param {string} props.preselectedUserType - The preselected user type
 * @param {propTypes.userTypes} props.userTypes - The user types
 * @param {propTypes.listingFields} props.userFields - The user fields
 * @returns {JSX.Element}
 */
const SignupForm = props => {
  const intl = useIntl();
  return <SignupFormComponent {...props} intl={intl} />;
};

export default SignupForm;
