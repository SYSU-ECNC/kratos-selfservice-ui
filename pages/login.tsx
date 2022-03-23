import {
  Box,
  Button,
  Image,
  Center,
  Container,
  Text,
  VStack,
  Input,
  Flex,
  Heading,
  ChakraProvider,
  StackDivider,
  FormControl,
  FormLabel,
  Link as ChakraLink
} from '@chakra-ui/react'
import { Wechat, LarkOne, School } from '@icon-park/react'
import { isUiNodeInputAttributes } from '@ory/integrations/ui'
import {
  SelfServiceLoginFlow,
  SubmitSelfServiceLoginFlowBody,
  UiNodeInputAttributes
} from '@ory/kratos-client'
import { CardTitle } from '@ory/themes'
import { AxiosError } from 'axios'
import type { GetServerSidePropsContext, GetServerSidePropsResult, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import {
  ActionCard,
  CenterLink,
  createLogoutHandler,
  Flow,
  MarginCard
} from '../pkg'
import { handleGetFlowError, handleFlowError } from '../pkg/errors'
import { getUrlForFlow } from '../pkg/helper'
import ory, { serverApi as oryServerApi } from '../pkg/sdk'

interface InputBox_Value {
  title: string
  variant?: string
  placeholder?: string
  height: number
}
function InputBox(props: InputBox_Value) {
  return (
    <Box w="100%">
      <Container fontSize="16" color="gray.700" m="0" p="0">
        {props.title}
      </Container>
      <Input
        variant={props.variant ? props.variant : 'filled'}
        placeholder={props.placeholder ? props.placeholder : ''}
        w="100%"
        h={props.height}
      />
    </Box>
  )
}

export function getServerSideProps(context: GetServerSidePropsContext) {
  const {
    return_to: returnTo,
    flow: flowId,
    // Refresh means we want to refresh the session. This is needed, for example, when we want to update the password
    // of a user.
    refresh,
    // AAL = Authorization Assurance Level. This implies that we want to upgrade the AAL, meaning that we want
    // to perform two-factor authentication/verification.
    aal
  } = context.query;

  if (!flowId) {
    const initFlowUrl = getUrlForFlow(
      'login',
      new URLSearchParams({
        aal: aal?.toString() || '',
        refresh: refresh?.toString() || '',
        return_to: returnTo?.toString() || ''
      })
    )

    return {
      redirect: {
        permanent: false,
        destination: initFlowUrl,
      }
    }
  }

  return oryServerApi.getSelfServiceLoginFlow(String(flowId), context.req.headers.cookie)
    .then(({ data: flow }) => {
      const userAgent = context.req.headers['user-agent'] || '';

      if (userAgent.includes('Lark')) {
        oryServerApi.submitSelfServiceLoginFlow(flow.id, undefined, {
          method: 'oidc',
          provider: 'lark'
        })
      }
      
      if (userAgent.includes('MicroMessenger')) {
        oryServerApi.submitSelfServiceLoginFlow(flow.id, undefined, {
          method: 'oidc',
          provider: 'wecom',
        })
      }

      return {
        props: {
          flow,
        }
      }
    })
    .catch((err: AxiosError) => {
      if (err.response?.status === 422) {
        const redirectTo = err.response?.data['redirect_browser_to'];
        return {
          redirect: {
            permanent: false,
            destination: redirectTo,
          }
        }
      }

      return {
        props: {
          err,
        }
      }
    })
}

const Login: NextPage<{
  flow?: SelfServiceLoginFlow,
  err?: AxiosError,
}> = ({
  flow, err
}) => {
  // This might be confusing, but we want to show the user an option
  // to sign out if they are performing two-factor authentication!
  // const onLogout = createLogoutHandler([aal, refresh])

  const router = useRouter();

  const onSubmit = (values: SubmitSelfServiceLoginFlowBody) =>
    router
      // On submission, add the flow ID to the URL but do not navigate. This prevents the user loosing
      // his data when she/he reloads the page.
      .push(`/login?flow=${flow?.id}`, undefined, { shallow: true })
      .then(() =>
        ory
          .submitSelfServiceLoginFlow(String(flow?.id), undefined, values)
          // We logged in successfully! Let's bring the user home.
          .then((res) => {
            if (flow?.return_to) {
              window.location.href = flow?.return_to
              return
            }
            router.push('/')
          })
          .then(() => {})
          // .catch(handleFlowError(router, 'login', setFlow))
          .catch((err: AxiosError) => {
            // If the previous handler did not catch the error it's most likely a form validation error
            if (err.response?.status === 400) {
              // Yup, it is!
              // setFlow(err.response?.data)
              return
            }

            return Promise.reject(err)
          })
      )

  return (
    <ChakraProvider>
      <Flex
        bgImage="url('images/login_bg.jpeg')"
        bgPosition="bottom left"
        bgRepeat="no-repeat"
        h="100vh"
        w="100vw"
        bgSize="cover"
      >
        <Flex flex="1" px="20" py="14" direction="column">
          <Box flex="1">
            <Image src="images/ecnc_white.svg" w="72px" h="72px" />
          </Box>

          <ChakraLink
            href="https://www.freepik.com/"
            fontSize="14"
            color="whiteAlpha.600"
            fontFamily="Raleway"
            textAlign="right"
            isExternal={true}
            textDecoration="underline"
          >
            Background Image Designed by Freepik
          </ChakraLink>
        </Flex>

        <VStack
          spacing={12}
          w="592px"
          px="20"
          bg="white"
          justify="center"
          align="stretch"
        >
          {flow && !flow?.refresh && flow?.requested_aal !== 'aal2' ? (
            <form method={flow?.ui.method} action={flow?.ui.action}>
              <Heading
                textStyle="3xl"
                color="blue.600"
                fontWeight="normal"
                fontFamily="Raleway"
              >
                Log In to ECNC Workspace
              </Heading>

              <VStack
                w="100%"
                spacing={6}
                divider={<StackDivider borderColor="gray.200" />}
                align="stretch"
              >
                <VStack spacing={6} w="100%">
                  <Button
                    colorScheme="blue"
                    color="#3370FF"
                    border="2px"
                    variant="outline"
                    w="100%"
                    leftIcon={<LarkOne theme="outline" size="18" />}
                    type="submit"
                    name="provider"
                    value="lark"
                  >
                    使用 飞书 登录
                  </Button>

                  <Button
                    colorScheme="blue"
                    color="#2AAE67"
                    border="2px"
                    variant="outline"
                    w="100%"
                    leftIcon={<Wechat theme="outline" size="18" />}
                    type="submit"
                    name="provider"
                    value="wecom"
                  >
                    使用 微信 登录
                  </Button>

                  <Button
                    colorScheme="blue"
                    color="#005826"
                    border="2px"
                    variant="outline"
                    w="100%"
                    leftIcon={<School theme="outline" size="18" />}
                    isDisabled={true}
                  >
                    使用 CAS 登录
                  </Button>
                </VStack>

                <Box>
                  <Text
                    fontSize="12"
                    color="blackAlpha.500"
                    fontWeight="bold"
                    fontFamily="Raleway"
                  >
                    or Login with your ECNC Account
                  </Text>

                  <VStack mt={6} spacing={6} align="stretch">
                    <FormControl>
                      <FormLabel>NetID</FormLabel>
                      <Input variant="filled" name="password_identifier" />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Password</FormLabel>
                      <Input
                        variant="filled"
                        name="password"
                        type="password"
                        placeholder="注意不是 NetID 的密码"
                      />
                    </FormControl>
                  </VStack>

                  <Input
                    type="hidden"
                    name="csrf_token"
                    readOnly={true}
                    value={
                      (
                        flow?.ui.nodes.find(
                          (node) =>
                            (node.attributes as UiNodeInputAttributes).name ===
                            'csrf_token'
                        )?.attributes as UiNodeInputAttributes
                      )?.value
                    }
                  />

                  <Button
                    colorScheme="blue"
                    color="blue.600"
                    variant="outline"
                    fontSize="14"
                    border="2px"
                    mt="8"
                    w="100%"
                    type="submit"
                  >
                    Login
                  </Button>
                </Box>
              </VStack>
            </form>
          ) : (
            <span>Loading...</span>
          )}
        </VStack>
      </Flex>
    </ChakraProvider>
  )
}

export default Login
