import {
  SelfServiceLoginFlow,
  SubmitSelfServiceLoginFlowBody
} from '@ory/kratos-client'
import { CardTitle } from '@ory/themes'
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
import { Box, Button, Image ,Center,Container,Grid,Stack,VStack,Input } from '@chakra-ui/react'
import {Wechat, LarkOne,School} from  '@icon-park/react'
interface InputBox_Value{
  title:string;
  variant?:string;
  placeholder?:string;
  height:number;
}
function InputBox(props:InputBox_Value){
  return(
    <Box w="100%">
        <Container fontSize="16" color="gray.700" m="0" p="0">
            {props.title}
        </Container>
       <Input variant={props.variant?props.variant:"filled"} placeholder={props.placeholder?props.placeholder:''} w="100%" h={props.height}/>
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
const SWIDTH =  (window.innerWidth)
  const MAXHIGHT = window.innerWidth * 0.666667
  const SHEIGHT =Math.min(window.innerHeight,MAXHIGHT)
  const FWIDTH = window.innerWidth * 0.412
  const BWIDTH = window.innerWidth * 0.3
  const BHEIGHT = window.innerWidth * 0.0333
  const GAP =  window.innerWidth * 0.0333;
  return (
  <Box   
    bgImage="url('images/login_bg.jpeg')"
    bgPosition="center"
    bgRepeat="no-repeat"
    h={SHEIGHT}
    w={SWIDTH}
    bgSize="100%"
    mt={MAXHIGHT>window.innerHeight? 0:((window.innerHeight-MAXHIGHT)/2)}
  >
    <Container fontSize="14" color="gray.300" fontFamily="Raleway" pos="absolute" maxW={SWIDTH-BWIDTH-BWIDTH}  top={SHEIGHT*0.95} left={SWIDTH*0.3194} p="0" m="0">
              Nature vector created by freepik - www.freepik.com
    </Container>

    <Center w={FWIDTH} h={SHEIGHT} bg="#fff" pos="absolute"  pt="42" pb="42"  left={ window.innerWidth-FWIDTH }>

    
      <VStack    spacing={GAP*0.8}>
        <Container fontSize="30" color="blue.600" fontFamily="Raleway" w={BWIDTH} p="0" m="0">
          Log In to ECNC Workspace
        </Container>
        
        <VStack  spacing={GAP*0.8} >
          <Button  colorScheme="blue" color="#3370FF" border="2px"  variant="outline"     w={BWIDTH} h={BHEIGHT}>
            <LarkOne theme="outline" size="24" fill="#3370FF"/>
            Continue with Lark
          </Button>
        
         
          <Button  colorScheme="blue" color="#2AAE67" border="2px"  variant="outline" w={BWIDTH} h={BHEIGHT}>
              <Wechat theme="outline" size="24" fill="#2AAE67"/>
              Continue with WeChat
          </Button>
         
          
          <Button  colorScheme="blue" color="#005826" border="2px"  variant="outline" w={BWIDTH} h={BHEIGHT}>
              <School theme="outline" size="24" fill="#005826"/>
              Continue with SYSU CAS
          </Button>
        </VStack>
        <Box w={BWIDTH} borderTopStyle="solid" borderTopWidth="1px" borderColor="gray.200" mt={GAP} pt="10px">
          <Container fontSize="12" color="blackAlpha.500" fontFamily="Raleway" w={BWIDTH} p="0" m="0">
              or Login with your ECNC Account
          </Container>
        </Box>
        <VStack mt={GAP} w={BWIDTH} spacing={GAP/2}>
          
           <InputBox title="NetId"  height = {BHEIGHT}/>
           <InputBox title="Password"  height = {BHEIGHT} placeholder="注意不是 NetID 的密码"/>
           
            
        </VStack>

        <Button  colorScheme="blue" color="blue.600" variant="outline" w={BWIDTH} h={BHEIGHT*0.8}
             fontSize="14" border="2px" 
           >
              Login
          </Button>
      </VStack>
      
    </Center>

    <Image 
     src="images/ecnc_white.png" pl='72px' pt="56px">
    </Image>

    
 

    
  </Box>

  );
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
