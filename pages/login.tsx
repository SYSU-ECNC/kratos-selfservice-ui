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
import {
  SelfServiceLoginFlow,
  SubmitSelfServiceLoginFlowBody
} from '@ory/kratos-client'
import { CardTitle, CodeBox } from '@ory/themes'
import { AxiosError } from 'axios'
import type { NextPage } from 'next'
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
import ory from '../pkg/sdk'

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

const Login: NextPage = () => {
  const [flow, setFlow] = useState<SelfServiceLoginFlow>()

  // Get ?flow=... from the URL
  const router = useRouter()
  const {
    return_to: returnTo,
    flow: flowId,
    // Refresh means we want to refresh the session. This is needed, for example, when we want to update the password
    // of a user.
    refresh,
    // AAL = Authorization Assurance Level. This implies that we want to upgrade the AAL, meaning that we want
    // to perform two-factor authentication/verification.
    aal
  } = router.query

  // This might be confusing, but we want to show the user an option
  // to sign out if they are performing two-factor authentication!
  const onLogout = createLogoutHandler([aal, refresh])

  useEffect(() => {
    // If the router is not ready yet, or we already have a flow, do nothing.
    if (!router.isReady || flow) {
      return
    }

    // If ?flow=.. was in the URL, we fetch it
    if (flowId) {
      ory
        .getSelfServiceLoginFlow(String(flowId))
        .then(({ data }) => {
          setFlow(data)
        })
        .catch(handleGetFlowError(router, 'login', setFlow))
      return
    }

    // Otherwise we initialize it
    ory
      .initializeSelfServiceLoginFlowForBrowsers(
        Boolean(refresh),
        aal ? String(aal) : undefined,
        returnTo ? String(returnTo) : undefined
      )
      .then(({ data }) => {
        setFlow(data)
      })
      .catch(handleFlowError(router, 'login', setFlow))
  }, [flowId, router, router.isReady, aal, refresh, returnTo, flow])

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
          .catch(handleFlowError(router, 'login', setFlow))
          .catch((err: AxiosError) => {
            // If the previous handler did not catch the error it's most likely a form validation error
            if (err.response?.status === 400) {
              // Yup, it is!
              setFlow(err.response?.data)
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
              >
                Continue with Lark
              </Button>

              <Button
                colorScheme="blue"
                color="#2AAE67"
                border="2px"
                variant="outline"
                w="100%"
                leftIcon={<Wechat theme="outline" size="18" />}
              >
                Continue with WeChat
              </Button>

              <Button
                colorScheme="blue"
                color="#005826"
                border="2px"
                variant="outline"
                w="100%"
                leftIcon={<School theme="outline" size="18" />}
              >
                Continue with SYSU CAS
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
                  <Input variant="filled" />
                </FormControl>

                <FormControl>
                  <FormLabel>Password</FormLabel>
                  <Input
                    variant="filled"
                    type="password"
                    placeholder="注意不是 NetID 的密码"
                  />
                </FormControl>
              </VStack>

              <Button
                colorScheme="blue"
                color="blue.600"
                variant="outline"
                fontSize="14"
                border="2px"
                mt="8"
                w="100%"
              >
                Login
              </Button>
            </Box>
          </VStack>
        </VStack>
      </Flex>
    </ChakraProvider>
  )
  //
  return (
    <>
      <Head>
        <title>Sign in - Ory NextJS Integration Example</title>
        <meta name="description" content="NextJS + React + Vercel + Ory" />
      </Head>
      <MarginCard>
        <CardTitle>
          {(() => {
            if (flow?.refresh) {
              return 'Confirm Action'
            } else if (flow?.requested_aal === 'aal2') {
              return 'Two-Factor Authentication'
            }
            return 'Sign In'
          })()}
        </CardTitle>
        <Flow onSubmit={onSubmit} flow={flow} />
      </MarginCard>
      {aal || refresh ? (
        <ActionCard>
          <CenterLink data-testid="logout-link" onClick={onLogout}>
            Log out
          </CenterLink>
        </ActionCard>
      ) : (
        <>
          <ActionCard>
            <Link href="/registration" passHref>
              <CenterLink>Create account</CenterLink>
            </Link>
          </ActionCard>
          <ActionCard>
            <Link href="/recovery" passHref>
              <CenterLink>Recover your account</CenterLink>
            </Link>
          </ActionCard>
        </>
      )}
    </>
  )
}

export default Login
