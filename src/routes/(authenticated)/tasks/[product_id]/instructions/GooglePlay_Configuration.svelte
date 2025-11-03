<h3>Instructions</h3>
<ul>
  <li>
    In the <strong>Publishing &gt; App Publishing</strong>
    configuration page:
    <ul>
      <li>
        Enable Scriptoria by selecting the <strong>We would like to use Scriptoria</strong>
        option.
      </li>
    </ul>
  </li>
  <li>
    In the <strong>Publishing &gt; Google Play Store Listing</strong>
    configuration page:
    <ul>
      <li>Fill out the Play Listing information.</li>
    </ul>
  </li>
  <li>
    In the <strong>Publishing &gt; Publishing Properties</strong>
    configuration page:
    <ul>
      <li>Fill out any needed publishing properties.</li>
      <li>
        For new apps, set <strong>BUILD_ANDROID_AAB</strong>
        to the value 1.
      </li>
      <li>
        For new apps, set <strong>BUILD_KEYSTORE</strong>
        to the name of a keystore not used to publish APKs.
      </li>
      <li>
        For existing apps, if you have previously manually uploaded Play Listing information to
        Google Play
        <br />
        and the Play Listing information is not in the Google Play Store Listing configuration page,
        <br />
        set
        <strong>BUILD_DOWNLOAD_PLAY_LISTING</strong>
        to the value 1.
        <br />
        During the build, the Play Listing information will be downloaded from Google Play
        <br />
        and will be available to import into the Google Play Store Listing configuration page.
        <br />
        On the Scriptoria page, you will need to uncheck the
        <strong>Verify Google Play Store listing when sending app data</strong>
        .
        <br />
        The downloaded Play Listing will be used during the publishing process.
      </li>
      <li>
        See the <a href="https://app.scriptoria.io/docs/Publishing+Properties.pdf" target="_blank">
          Publishing Properties Documentation
        </a>
        for more details.
      </li>
    </ul>
  </li>
  <li>
    In the <strong>Publishing &gt; Scriptoria</strong>
    configuration page:
    <ul>
      <li>
        Copy and Paste the above <strong>App Project URL</strong>
        into the
        <strong>Enter App Project URL</strong>
        field.
      </li>
      <li>For existing apps, if you have previously</li>
      <li>
        Click <strong>Login...</strong>
        to connect to Scriptoria.
      </li>
      <li>
        Click <strong>Upload</strong>
        and successfully upload the data to the app publishing repository.
      </li>
    </ul>
  </li>
  <li>
    To continue:
    <ul>
      <li>
        If this is a new app that has not been uploaded to Google Play yet, click <strong>
          New App
        </strong>
        .
      </li>
      <li>
        If this is an app that already exists in Google Play, click <strong>Existing App</strong>
        .
      </li>
    </ul>
  </li>
</ul>
