package org.example.speaknotebackend.domain.oauth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(oneOf = {OauthRes.class})
public interface GetSocialOAuthRes {}
